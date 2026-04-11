/**
 * Supabase Edge Function: Firebase ↔ Supabase JWT Bridge
 *
 * Accepts a Firebase ID token, verifies it against Google's public x509 certs,
 * upserts a users row, and mints a Supabase JWT with users.id as `sub`.
 *
 * Environment secrets required (set via `supabase secrets set`):
 *   FIREBASE_PROJECT_ID   — e.g. "last-man-standing-abc12"
 *   SUPABASE_JWT_SECRET   — auto-set by Supabase
 *   SUPABASE_URL          — auto-set by Supabase
 *   SUPABASE_SERVICE_ROLE_KEY — auto-set by Supabase
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { importX509, jwtVerify, SignJWT, decodeProtectedHeader } from 'https://deno.land/x/jose@v5.2.2/index.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// ─── Google public cert cache ────────────────────────────────────────────────

interface CertCache {
  certs: Record<string, string>;
  fetchedAt: number;
}

const CERT_URL =
  'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';
const CERT_TTL = 60 * 60 * 1000; // 1 hour

let certCache: CertCache | null = null;

async function getGoogleCerts(): Promise<Record<string, string>> {
  if (certCache && Date.now() - certCache.fetchedAt < CERT_TTL) {
    return certCache.certs;
  }
  const res = await fetch(CERT_URL);
  if (!res.ok) throw new Error(`Failed to fetch Google certs: ${res.status}`);
  const certs = (await res.json()) as Record<string, string>;
  certCache = { certs, fetchedAt: Date.now() };
  return certs;
}

// ─── Firebase ID token verification ──────────────────────────────────────────

interface FirebaseClaims {
  sub: string;
  email?: string;
  name?: string;
}

async function verifyFirebaseToken(
  idToken: string,
  projectId: string,
): Promise<FirebaseClaims> {
  const header = decodeProtectedHeader(idToken);
  const kid = header.kid;
  if (!kid) throw new Error('Missing kid in token header');

  const certs = await getGoogleCerts();
  const cert = certs[kid];
  if (!cert) throw new Error('No matching certificate for kid');

  const publicKey = await importX509(cert, 'RS256');
  const { payload } = await jwtVerify(idToken, publicKey, {
    issuer: `https://securetoken.google.com/${projectId}`,
    audience: projectId,
  });

  const sub = payload.sub;
  if (!sub) throw new Error('Missing sub claim');

  return {
    sub,
    email: payload.email as string | undefined,
    name: payload.name as string | undefined,
  };
}

// ─── Handler ─────────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }

  try {
    const { idToken } = (await req.json()) as { idToken?: string };
    if (!idToken) {
      return new Response(
        JSON.stringify({ error: 'Missing idToken' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const projectId = Deno.env.get('FIREBASE_PROJECT_ID');
    if (!projectId) {
      return new Response(
        JSON.stringify({ error: 'Server misconfigured: missing FIREBASE_PROJECT_ID' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // 1. Verify Firebase token
    const claims = await verifyFirebaseToken(idToken, projectId);

    // 2. Upsert user row (service role — bypasses RLS)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const displayName =
      claims.name ||
      (claims.email ? claims.email.split('@')[0] : 'Player');

    const { data: user, error: upsertError } = await supabase
      .from('users')
      .upsert(
        { firebase_uid: claims.sub, display_name: displayName },
        { onConflict: 'firebase_uid' },
      )
      .select('id')
      .single();

    if (upsertError || !user) {
      console.error('[bridge] user upsert failed:', upsertError);
      return new Response(
        JSON.stringify({ error: 'Account setup failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // 3. Mint Supabase JWT — sub = users.id (UUID)
    const jwtSecret = Deno.env.get('SUPABASE_JWT_SECRET')!;
    const now = Math.floor(Date.now() / 1000);
    const exp = now + 3600; // 1 hour

    const secret = new TextEncoder().encode(jwtSecret);
    const accessToken = await new SignJWT({
      sub: user.id,
      role: 'authenticated',
      aud: 'authenticated',
      iat: now,
      exp,
    })
      .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
      .sign(secret);

    return new Response(
      JSON.stringify({
        access_token: accessToken,
        refresh_token: '',
        expires_in: 3600,
        user_id: user.id,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[bridge] error:', message);

    const status = message.includes('token') || message.includes('kid') || message.includes('sub')
      ? 401
      : 500;

    return new Response(
      JSON.stringify({ error: status === 401 ? 'Invalid token' : 'Auth service unavailable' }),
      { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
