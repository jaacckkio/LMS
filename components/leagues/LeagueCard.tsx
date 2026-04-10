import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { SurvivorCount } from '../ui/SurvivorCount';
import { Colors, Radius, Spacing, Typography } from '../../constants/theme';
import { League } from '../../types';
import { getCompetition } from '../../constants/competitions';

interface Props {
  league: League;
  userStatus: 'ALIVE' | 'ELIMINATED' | 'GUEST' | null;
  onPress: () => void;
  /** Optional stake subtitle. */
  stake?: string | null;
}

const STATUS_STYLE = {
  ALIVE: { bg: Colors.primary + '20', color: Colors.primary, label: 'ALIVE' },
  ELIMINATED: { bg: Colors.danger + '20', color: Colors.danger, label: 'OUT' },
  GUEST: { bg: Colors.textMuted + '20', color: Colors.textMuted, label: 'GUEST' },
} as const;

export function LeagueCard({ league, userStatus, onPress, stake }: Props) {
  const competition = getCompetition(league.competitionId);
  const statusStyle = userStatus ? STATUS_STYLE[userStatus] : null;

  // Inverted progress bar: starts full (100%), shrinks as people are eliminated.
  // Represents the surviving field collapsing.
  const pct = league.totalMembers > 0
    ? Math.round((league.aliveMembers / league.totalMembers) * 100)
    : 100;

  const eliminated = league.totalMembers - league.aliveMembers;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      {/* Top row: flag + name (wraps to 2 lines, never truncated) + status pill */}
      <View style={styles.topRow}>
        <Text style={styles.flag}>{competition.flag}</Text>
        <View style={styles.nameWrap}>
          <Text style={styles.name} numberOfLines={2}>{league.name}</Text>
          {stake ? <Text style={styles.stake}>{stake}</Text> : null}
        </View>
        {statusStyle && (
          <View style={[styles.statusPill, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.color }]}>
              {statusStyle.label}
            </Text>
          </View>
        )}
      </View>

      {/* Survivor count block */}
      <SurvivorCount alive={league.aliveMembers} eliminated={eliminated} />

      {/* Inverted shrinking bar */}
      <View style={styles.bar}>
        <View style={[styles.barFill, { width: `${pct}%` as `${number}%` }]} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.base,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  topRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  flag: { fontSize: 18, marginTop: 2 },
  nameWrap: { flex: 1, gap: 2 },
  name: {
    fontSize: Typography.md,
    fontWeight: '700',
    color: Colors.text,
  },
  stake: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  statusPill: {
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
  },
  statusText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  bar: {
    height: 3,
    backgroundColor: Colors.danger + '30', // red track — field is collapsing
    borderRadius: 2,
  },
  barFill: {
    height: 3,
    backgroundColor: Colors.primary, // green = survivors remaining
    borderRadius: 2,
  },
});
