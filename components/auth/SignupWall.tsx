import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  TextInput,
  StyleSheet,
  Animated,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Text,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { TeamCrest } from '../ui/TeamCrest';
import { Button } from '../ui/Button';
import { signInWithEmail, signUpWithEmail } from '../../lib/firebase';
import { FEATURES } from '../../constants/features';
import { Colors, Spacing, Radius, Typography } from '../../constants/theme';
import { ApiTeam } from '../../types';

const SHEET_HEIGHT = 480;

interface Props {
  /** The team the guest just picked. null = hidden. */
  pendingTeam: ApiTeam | null;
  /** Round name for display, e.g. "Gameweek 12". */
  roundName: string;
  /** Called after successful auth. */
  onAuthenticated: () => void;
  /** Called when user dismisses without signing up. */
  onDismiss: () => void;
}

/**
 * Post-pick signup wall. Appears after a guest taps "Lock in".
 * Shows the pending pick, email auth form (Apple/Google hidden behind
 * FEATURES.socialAuth flag), and "Continue as Guest" ghost link.
 *
 * Modal + Animated + translateY spring pattern (no Reanimated).
 */
export function SignupWall({ pendingTeam, roundName, onAuthenticated, onDismiss }: Props) {
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const visible = !!pendingTeam;

  const [isSignIn, setIsSignIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      setEmail('');
      setPassword('');
      setIsSignIn(false);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        damping: 20,
        stiffness: 200,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: SHEET_HEIGHT,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleEmailAuth = async () => {
    if (!email.trim() || !password) return;
    setLoading(true);
    try {
      if (isSignIn) {
        await signInWithEmail(email.trim(), password);
      } else {
        await signUpWithEmail(email.trim(), password);
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onAuthenticated();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onDismiss} statusBarTranslucent>
      <TouchableWithoutFeedback onPress={onDismiss}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'position' : undefined}
        style={styles.kav}
        pointerEvents="box-none"
      >
        <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
          <View style={styles.handle} />

          {/* Pick preview */}
          {pendingTeam && (
            <View style={styles.pickPreview}>
              <TeamCrest uri={pendingTeam.crest} size={48} state="selected" />
              <View>
                <Text style={styles.pickTitle}>
                  Lock in {pendingTeam.shortName}
                </Text>
                <Text style={styles.pickSub}>for {roundName}</Text>
              </View>
            </View>
          )}

          <Text style={styles.headline}>Sign up to save your pick</Text>
          <Text style={styles.subtext}>
            Your pick will be locked in immediately after signing up.
          </Text>

          {/* Email form (primary path when socialAuth flag is off) */}
          <View style={styles.form}>
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
              title={isSignIn ? 'Sign In & Lock Pick' : 'Create Account & Lock Pick'}
              onPress={handleEmailAuth}
              loading={loading}
            />
            <TouchableOpacity onPress={() => setIsSignIn(!isSignIn)}>
              <Text style={styles.toggleText}>
                {isSignIn ? "No account? Sign up" : 'Have an account? Sign in'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Guest continue */}
          <TouchableOpacity onPress={onDismiss} style={styles.guestBtn}>
            <Text style={styles.guestText}>Continue as Guest</Text>
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: Colors.overlay,
  },
  kav: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: Colors.surfaceElevated,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing['4xl'],
    paddingTop: Spacing.md,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
  pickPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.primary + '10',
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  pickTitle: {
    fontSize: Typography.md,
    fontWeight: '700',
    color: Colors.text,
  },
  pickSub: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
  },
  headline: {
    fontSize: Typography.xl,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.3,
    marginBottom: Spacing.xs,
  },
  subtext: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  form: { gap: Spacing.sm },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    color: Colors.text,
    fontSize: Typography.base,
  },
  toggleText: {
    textAlign: 'center',
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  guestBtn: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    marginTop: Spacing.sm,
  },
  guestText: {
    fontSize: Typography.sm,
    color: Colors.textMuted,
  },
});
