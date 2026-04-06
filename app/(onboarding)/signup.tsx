/**
 * Onboarding Screen 3: Post-pick signup
 * "You're in. Your pick is locked."
 */
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Text } from '../../components/ui/Text';
import { Button } from '../../components/ui/Button';
import { TeamCrest } from '../../components/ui/TeamCrest';
import { Card } from '../../components/ui/Card';
import { Colors, Spacing, Radius } from '../../constants/theme';
import { getTeamById } from '../../constants/teams';
import { signUpWithEmail, signInWithEmail } from '../../lib/firebase';

export default function SignupScreen() {
  const { teamId, gameweek } = useLocalSearchParams<{ teamId: string; gameweek: string }>();
  const team = teamId ? getTeamById(teamId) : null;

  const [mode, setMode] = useState<'choose' | 'email'>('choose');
  const [isSignIn, setIsSignIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async () => {
    if (!email || !password) return;
    setLoading(true);
    try {
      if (isSignIn) {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password);
      }
      router.replace('/(onboarding)/league-setup');
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.kav}
      >
        <View style={styles.inner}>
          {/* Pick confirmation banner */}
          <Card elevated style={styles.pickBanner}>
            <Text variant="label" color={Colors.alive} style={styles.lockedLabel}>
              Pick Locked
            </Text>
            <View style={styles.pickRow}>
              {team && <TeamCrest uri={team.crest} size={40} />}
              <View>
                <Text variant="subheading">{team?.name ?? 'Your Team'}</Text>
                <Text variant="caption" color={Colors.textSecondary}>
                  Gameweek {gameweek}
                </Text>
              </View>
              <Text style={styles.checkmark}>✓</Text>
            </View>
          </Card>

          <View style={styles.hero}>
            <Text style={styles.headline}>You're in.</Text>
            <Text variant="body" color={Colors.textSecondary}>
              Create an account to save your pick and track your progress.
            </Text>
          </View>

          {mode === 'choose' ? (
            <View style={styles.authButtons}>
              <Button
                title="Continue with Apple"
                onPress={() => Alert.alert('Coming soon', 'Apple Sign-In requires native setup')}
                variant="secondary"
                style={styles.authBtn}
              />
              <Button
                title="Continue with Google"
                onPress={() => Alert.alert('Coming soon', 'Google Sign-In requires native setup')}
                variant="secondary"
                style={styles.authBtn}
              />
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text variant="caption" color={Colors.textMuted} style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>
              <Button
                title="Continue with Email"
                onPress={() => setMode('email')}
                variant="ghost"
                style={styles.authBtn}
              />
            </View>
          ) : (
            <View style={styles.emailForm}>
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={Colors.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={Colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              <Button
                title={isSignIn ? 'Sign In' : 'Create Account'}
                onPress={handleEmailAuth}
                loading={loading}
                style={styles.authBtn}
              />
              <TouchableOpacity onPress={() => setIsSignIn(!isSignIn)}>
                <Text variant="caption" color={Colors.textSecondary} style={styles.toggleText}>
                  {isSignIn ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setMode('choose')}>
                <Text variant="caption" color={Colors.textMuted} style={styles.toggleText}>
                  ← Back
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  kav: { flex: 1 },
  inner: { flex: 1, paddingHorizontal: Spacing.xl, paddingVertical: Spacing['2xl'], gap: Spacing.xl },
  pickBanner: { borderColor: Colors.alive + '40' },
  lockedLabel: { marginBottom: Spacing.sm },
  pickRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  checkmark: { marginLeft: 'auto', fontSize: 28, color: Colors.alive },
  hero: { gap: Spacing.sm },
  headline: { fontSize: 42, fontWeight: '800', color: Colors.text, letterSpacing: -1.5 },
  authButtons: { gap: Spacing.sm },
  authBtn: { width: '100%' },
  divider: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginVertical: Spacing.xs },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { paddingHorizontal: Spacing.xs },
  emailForm: { gap: Spacing.sm },
  input: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    color: Colors.text,
    fontSize: 16,
  },
  toggleText: { textAlign: 'center', marginTop: Spacing.sm },
});
