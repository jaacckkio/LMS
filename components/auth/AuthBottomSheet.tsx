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
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Text,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useAuthModal } from '../../contexts/AuthModal';
import { signInWithEmail, signUpWithEmail } from '../../lib/firebase';
import { Colors, Spacing, Radius, Typography } from '../../constants/theme';
import { FEATURES } from '../../constants/features';
import { Button } from '../ui/Button';

const SHEET_HEIGHT = Dimensions.get('window').height * 0.72;

export function AuthBottomSheet() {
  const { visible, hide, reason } = useAuthModal();
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const [mode, setMode] = useState<'options' | 'email'>('options');
  const [isSignIn, setIsSignIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      setMode('options');
      setEmail('');
      setPassword('');
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true, damping: 22, stiffness: 220 }),
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, { toValue: SHEET_HEIGHT, duration: 250, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
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
      hide();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={hide} statusBarTranslucent>
      <TouchableWithoutFeedback onPress={hide}>
        <Animated.View style={[styles.backdrop, { opacity }]} />
      </TouchableWithoutFeedback>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'position' : undefined}
        style={styles.kav}
        pointerEvents="box-none"
      >
        <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
          <View style={styles.handle} />

          {reason ? (
            <Text style={styles.reason}>{reason}</Text>
          ) : (
            <Text style={styles.title}>Join the game</Text>
          )}
          <Text style={styles.subtitle}>
            Sign up to save your picks, join leagues, and track your history.
          </Text>

          {mode === 'options' ? (
            <View style={styles.options}>
              {/* TODO: when social auth flag flips, all three buttons (Apple/Google/Email)
                  should be visually equal-weighted — currently Apple/Google are variant="secondary"
                  and Email is primary. Equalize before re-enabling. */}
              {FEATURES.socialAuth && (
                <>
                  <Button
                    title="Continue with Apple"
                    onPress={() => Alert.alert('Coming soon', 'Requires a native build with EAS')}
                    variant="secondary"
                    style={styles.optBtn}
                  />
                  <Button
                    title="Continue with Google"
                    onPress={() => Alert.alert('Coming soon', 'Requires a native build with EAS')}
                    variant="secondary"
                    style={styles.optBtn}
                  />
                  <View style={styles.divider}>
                    <View style={styles.divLine} />
                    <Text style={styles.divText}>or</Text>
                    <View style={styles.divLine} />
                  </View>
                </>
              )}
              <Button
                title="Continue with Email"
                onPress={() => setMode('email')}
                style={styles.optBtn}
              />
              <TouchableOpacity onPress={hide} style={styles.guestBtn}>
                <Text style={styles.guestText}>Continue as Guest</Text>
              </TouchableOpacity>
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
                autoFocus
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
                style={styles.optBtn}
              />
              <TouchableOpacity onPress={() => setIsSignIn(!isSignIn)}>
                <Text style={styles.toggleText}>
                  {isSignIn ? "No account? Sign up" : 'Have an account? Sign in'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setMode('options')}>
                <Text style={[styles.toggleText, { color: Colors.textMuted }]}>← Back</Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
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
    minHeight: SHEET_HEIGHT,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: Spacing.xl,
  },
  reason: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    color: Colors.text,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  title: {
    fontSize: Typography['2xl'],
    fontWeight: Typography.extrabold,
    color: Colors.text,
    letterSpacing: -0.5,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  options: { gap: Spacing.sm },
  optBtn: {},
  divider: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    marginVertical: Spacing.xs,
  },
  divLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  divText: { fontSize: Typography.sm, color: Colors.textMuted },
  guestBtn: { alignItems: 'center', paddingVertical: Spacing.sm },
  guestText: { fontSize: Typography.sm, color: Colors.textMuted },
  emailForm: { gap: Spacing.sm },
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
});
