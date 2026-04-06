import React, { useCallback, useRef, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import { Text } from '../ui/Text';
import { Button } from '../ui/Button';
import { TeamCrest } from '../ui/TeamCrest';
import { Colors, Spacing, Radius } from '../../constants/theme';
import { getTeamById } from '../../constants/teams';

interface Props {
  teamId: string | null;
  onLockIn: () => void;
  onDismiss: () => void;
  loading?: boolean;
}

export function LockInSheet({ teamId, onLockIn, onDismiss, loading }: Props) {
  const sheetRef = useRef<BottomSheet>(null);
  const team = teamId ? getTeamById(teamId) : null;

  useEffect(() => {
    if (teamId) {
      sheetRef.current?.expand();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      sheetRef.current?.close();
    }
  }, [teamId]);

  const handleSheetChange = useCallback(
    (index: number) => {
      if (index === -1) onDismiss();
    },
    [onDismiss]
  );

  if (!team) return null;

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={['38%']}
      enablePanDownToClose
      onChange={handleSheetChange}
      backgroundStyle={styles.sheetBg}
      handleIndicatorStyle={styles.indicator}
    >
      <BottomSheetView style={styles.content}>
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
      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheetBg: { backgroundColor: Colors.surfaceElevated },
  indicator: { backgroundColor: Colors.border },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    gap: Spacing.sm,
  },
  title: { marginTop: Spacing.sm },
  subtitle: { textAlign: 'center', lineHeight: 20 },
  btn: { width: '100%', marginTop: Spacing.sm },
  cancelBtn: { width: '100%' },
});
