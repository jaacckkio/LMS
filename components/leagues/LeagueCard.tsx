import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Colors, Radius, Spacing, Typography } from '../../constants/theme';
import { League } from '../../types';
import { getCompetition } from '../../constants/competitions';

interface Props {
  league: League;
  userStatus: 'ALIVE' | 'ELIMINATED' | 'GUEST' | null;
  onPress: () => void;
}

const STATUS_STYLE = {
  ALIVE: { bg: Colors.primary + '20', color: Colors.primary, label: 'ALIVE' },
  ELIMINATED: { bg: Colors.danger + '20', color: Colors.danger, label: 'OUT' },
  GUEST: { bg: Colors.textMuted + '20', color: Colors.textMuted, label: 'GUEST' },
} as const;

export function LeagueCard({ league, userStatus, onPress }: Props) {
  const competition = getCompetition(league.competitionId);
  const statusStyle = userStatus ? STATUS_STYLE[userStatus] : null;
  const pct = league.totalMembers > 0
    ? Math.round((league.aliveMembers / league.totalMembers) * 100)
    : 0;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.topRow}>
        <Text style={styles.flag}>{competition.flag}</Text>
        <Text style={styles.name} numberOfLines={1}>{league.name}</Text>
        {statusStyle && (
          <View style={[styles.statusPill, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.color }]}>
              {statusStyle.label}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.bottomRow}>
        <Text style={styles.comp}>{competition.shortName}</Text>
        <View style={styles.survivors}>
          <Text style={styles.aliveCount}>{league.aliveMembers}</Text>
          <Text style={styles.totalCount}>/{league.totalMembers} remaining</Text>
        </View>
      </View>

      {/* Progress bar */}
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
  topRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  flag: { fontSize: 18 },
  name: { flex: 1, fontSize: Typography.md, fontWeight: Typography.semibold, color: Colors.text },
  statusPill: {
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
  },
  statusText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  bottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  comp: { fontSize: Typography.sm, color: Colors.textSecondary },
  survivors: { flexDirection: 'row', alignItems: 'baseline', gap: 2 },
  aliveCount: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.primary },
  totalCount: { fontSize: Typography.sm, color: Colors.textSecondary },
  bar: { height: 3, backgroundColor: Colors.border, borderRadius: 2 },
  barFill: { height: 3, backgroundColor: Colors.primary, borderRadius: 2 },
});
