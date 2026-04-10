import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { TeamCrest } from '../ui/TeamCrest';
import { Colors, Spacing, Typography, Radius } from '../../constants/theme';

interface TopPick {
  tla: string;
  crest: string;
  shortName: string;
  percentage: number;
}

interface Props {
  picks: TopPick[];
  /** Optional title override. */
  title?: string;
}

/**
 * "Top picks this week" mini-leaderboard.
 * Shows up to 3 most-picked teams with crests, percentages, and mini bar chart.
 */
export function TopPicksMini({ picks, title = 'Top picks this week' }: Props) {
  if (picks.length === 0) return null;

  const maxPct = Math.max(...picks.map((p) => p.percentage), 1);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {picks.map((pick, i) => (
        <View key={pick.tla} style={styles.row}>
          <Text style={styles.rank}>{i + 1}</Text>
          <TeamCrest uri={pick.crest} size={28} state="default" />
          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={1}>{pick.shortName}</Text>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  { width: `${Math.round((pick.percentage / maxPct) * 100)}%` },
                ]}
              />
            </View>
          </View>
          <Text style={styles.pct}>{pick.percentage}%</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.base,
    gap: Spacing.sm,
  },
  title: {
    fontSize: Typography.xs,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  rank: {
    fontSize: Typography.sm,
    fontWeight: '800',
    color: Colors.textMuted,
    width: 16,
    textAlign: 'center',
  },
  info: { flex: 1, gap: 3 },
  name: {
    fontSize: Typography.sm,
    fontWeight: '600',
    color: Colors.text,
  },
  barTrack: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
  },
  barFill: {
    height: 4,
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  pct: {
    fontSize: Typography.sm,
    fontWeight: '700',
    color: Colors.primary,
    fontVariant: ['tabular-nums'],
    width: 36,
    textAlign: 'right',
  },
});
