import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { CountdownTimer } from '../ui/CountdownTimer';
import { TeamCrest } from '../ui/TeamCrest';
import { Card } from '../ui/Card';
import { Colors, Spacing, Radius, Typography } from '../../constants/theme';
import { GuestPick, PickResult } from '../../types';

interface Props {
  roundName: string;
  deadline: Date | null;
  currentPick: GuestPick | null;
  onPickPress: () => void;
}

export function RoundCard({ roundName, deadline, currentPick, onPickPress }: Props) {
  const locked = deadline ? deadline <= new Date() : false;

  return (
    <Card elevated style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.roundName}>{roundName}</Text>
        {deadline && !locked && <CountdownTimer deadline={deadline} size="sm" />}
        {locked && <Text style={styles.lockedTag}>LOCKED</Text>}
      </View>

      {currentPick ? (
        <PickDisplay pick={currentPick} onPress={onPickPress} locked={locked} />
      ) : (
        <TouchableOpacity style={styles.ctaRow} onPress={onPickPress} activeOpacity={0.8}>
          <View style={styles.ctaLeft}>
            <Text style={styles.ctaTitle}>Make Your Pick</Text>
            <Text style={styles.ctaBody}>
              {locked ? 'Deadline has passed' : 'Tap to choose your team →'}
            </Text>
          </View>
          {!locked && <View style={styles.chevron}><Text style={styles.chevronText}>›</Text></View>}
        </TouchableOpacity>
      )}
    </Card>
  );
}

const RESULT_COLOR: Record<PickResult, string> = {
  WIN: Colors.primary,
  LOSS: Colors.danger,
  DRAW: Colors.warning,
  PENDING: Colors.textSecondary,
};

const RESULT_LABEL: Record<PickResult, string> = {
  WIN: '✓ Survived',
  LOSS: '✕ Eliminated',
  DRAW: '≈ Survived (draw)',
  PENDING: 'Awaiting result',
};

function PickDisplay({
  pick,
  onPress,
  locked,
}: {
  pick: GuestPick;
  onPress: () => void;
  locked: boolean;
}) {
  const color = RESULT_COLOR[pick.result];
  const label = RESULT_LABEL[pick.result];

  return (
    <TouchableOpacity style={styles.pickRow} onPress={onPress} activeOpacity={0.8} disabled={locked}>
      <TeamCrest
        uri={pick.teamCrest}
        size={48}
        state={
          pick.result === 'WIN'
            ? 'selected'
            : pick.result === 'LOSS'
            ? 'eliminated'
            : 'default'
        }
      />
      <View style={styles.pickInfo}>
        <Text style={styles.pickTeam}>{pick.teamName}</Text>
        <Text style={[styles.pickResult, { color }]}>{label}</Text>
      </View>
      {!locked && pick.result === 'PENDING' && (
        <Text style={styles.changeText}>Change</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { gap: Spacing.md },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roundName: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    color: Colors.text,
  },
  lockedTag: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.warning,
    letterSpacing: 0.8,
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary + '12',
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.primary + '40',
  },
  ctaLeft: { flex: 1 },
  ctaTitle: { fontSize: Typography.md, fontWeight: Typography.semibold, color: Colors.primary },
  ctaBody: { fontSize: Typography.sm, color: Colors.textSecondary, marginTop: 2 },
  chevron: { marginLeft: Spacing.sm },
  chevronText: { fontSize: 24, color: Colors.primary, fontWeight: '300' },
  pickRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  pickInfo: { flex: 1 },
  pickTeam: { fontSize: Typography.md, fontWeight: Typography.semibold, color: Colors.text },
  pickResult: { fontSize: Typography.sm, marginTop: 2 },
  changeText: { fontSize: Typography.sm, color: Colors.textSecondary },
});
