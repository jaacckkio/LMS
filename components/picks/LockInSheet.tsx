import React, { useEffect, useRef } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Text } from '../ui/Text';
import { Button } from '../ui/Button';
import { TeamCrest } from '../ui/TeamCrest';
import { Colors, Spacing, Radius } from '../../constants/theme';
import { getTeamById } from '../../constants/teams';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SHEET_HEIGHT = 340;

interface Props {
  teamId: string | null;
  onLockIn: () => void;
  onDismiss: () => void;
  loading?: boolean;
}

export function LockInSheet({ teamId, onLockIn, onDismiss, loading }: Props) {
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const team = teamId ? getTeamById(teamId) : null;
  const visible = !!teamId;

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

  if (!team) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onDismiss}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={onDismiss}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
        <View style={styles.handle} />

        <View style={styles.content}>
          <TeamCrest uri={team.crest} size={64} />
          <Text variant="heading" style={styles.title}>
            Lock in {team.name}?
          </Text>
          <Text variant="body" color={Colors.textSecondary} style={styles.subtitle}>
            This cannot be undone. If {team.shortName} don't win, you're out.
          </Text>
          <Button
            title={`Lock In ${team.shortName}`}
            onPress={() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              onLockIn();
            }}
            loading={loading}
            style={styles.btn}
            haptic={false}
          />
          <Button
            title="Cancel"
            onPress={onDismiss}
            variant="ghost"
            style={styles.cancelBtn}
          />
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SHEET_HEIGHT,
    backgroundColor: Colors.surfaceElevated,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginTop: Spacing.md,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    gap: Spacing.sm,
  },
  title: { marginTop: Spacing.sm },
  subtitle: { textAlign: 'center', lineHeight: 20 },
  btn: { width: '100%', marginTop: Spacing.sm },
  cancelBtn: { width: '100%' },
});
