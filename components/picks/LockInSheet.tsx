import React, { useEffect, useRef } from 'react';
import {
  Modal,
  TouchableWithoutFeedback,
  View,
  StyleSheet,
  Animated,
  Dimensions,
  Text,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { TeamCrest } from '../ui/TeamCrest';
import { Button } from '../ui/Button';
import { Colors, Spacing, Radius, Typography } from '../../constants/theme';
import { ApiTeam } from '../../types';

const SHEET_HEIGHT = 320;

interface Props {
  team: ApiTeam | null;
  onLockIn: () => void;
  onDismiss: () => void;
  loading?: boolean;
}

export function LockInSheet({ team, onLockIn, onDismiss, loading }: Props) {
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const visible = !!team;

  useEffect(() => {
    if (visible) {
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

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onDismiss} statusBarTranslucent>
      <TouchableWithoutFeedback onPress={onDismiss}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
        <View style={styles.handle} />
        <View style={styles.content}>
          {team && <TeamCrest uri={team.crest} size={68} state="selected" />}
          <Text style={styles.title}>Lock in {team?.shortName ?? ''}?</Text>
          <Text style={styles.subtitle}>
            This cannot be undone.{'\n'}If {team?.tla} don't win, you're eliminated.
          </Text>
          <Button
            title={`Lock In ${team?.shortName ?? ''}`}
            onPress={() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              onLockIn();
            }}
            loading={loading}
            style={styles.btn}
            haptic={false}
          />
          <Button title="Cancel" onPress={onDismiss} variant="ghost" />
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: Colors.overlay,
  },
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: SHEET_HEIGHT,
    backgroundColor: Colors.surfaceElevated,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginTop: Spacing.md,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    gap: Spacing.sm,
  },
  title: {
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.text,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  btn: { width: '100%', marginTop: Spacing.sm },
});
