/**
 * AsyncStorage layer for guest picks and app preferences
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GuestPick } from '../types';

const KEYS = {
  activeCompetition: 'lms:active_competition',
  deviceId: 'lms:device_id',
  guestPicks: (competitionId: string) => `lms:guest_picks:${competitionId}`,
} as const;

// ─── Device ID ────────────────────────────────────────────────────────────────

export async function getOrCreateDeviceId(): Promise<string> {
  const existing = await AsyncStorage.getItem(KEYS.deviceId);
  if (existing) return existing;

  // Generate a simple UUID-like ID without native crypto
  const id = `device_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  await AsyncStorage.setItem(KEYS.deviceId, id);
  return id;
}

// ─── Active competition ───────────────────────────────────────────────────────

export async function getActiveCompetitionId(): Promise<string | null> {
  return AsyncStorage.getItem(KEYS.activeCompetition);
}

export async function setActiveCompetitionId(id: string): Promise<void> {
  await AsyncStorage.setItem(KEYS.activeCompetition, id);
}

// ─── Guest picks ──────────────────────────────────────────────────────────────

export async function getGuestPicks(competitionId: string): Promise<GuestPick[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.guestPicks(competitionId));
    if (!raw) return [];
    return JSON.parse(raw) as GuestPick[];
  } catch {
    return [];
  }
}

export async function saveGuestPick(pick: GuestPick): Promise<void> {
  const existing = await getGuestPicks(pick.competitionId);
  // Replace if same round, otherwise append
  const updated = [
    ...existing.filter((p) => p.roundId !== pick.roundId),
    pick,
  ];
  await AsyncStorage.setItem(
    KEYS.guestPicks(pick.competitionId),
    JSON.stringify(updated)
  );
}

export async function getGuestPickForRound(
  competitionId: string,
  roundId: string
): Promise<GuestPick | null> {
  const picks = await getGuestPicks(competitionId);
  return picks.find((p) => p.roundId === roundId) ?? null;
}

export async function getAllGuestPicks(): Promise<GuestPick[]> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const pickKeys = keys.filter((k) => k.startsWith('lms:guest_picks:'));
    if (pickKeys.length === 0) return [];
    const pairs = await AsyncStorage.multiGet(pickKeys);
    return pairs.flatMap(([, value]) => {
      if (!value) return [];
      try {
        return JSON.parse(value) as GuestPick[];
      } catch {
        return [];
      }
    });
  } catch {
    return [];
  }
}

export async function clearGuestPicks(competitionId: string): Promise<void> {
  await AsyncStorage.removeItem(KEYS.guestPicks(competitionId));
}
