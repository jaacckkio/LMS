import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Colors, Spacing, Typography } from '../../constants/theme';
import { LeagueMember } from '../../types';

interface Props {
  member: LeagueMember;
  rank: number;
  pickHidden: boolean;     // true until round deadline passes
  pickTeamName?: string;
}

export function MemberRow({ member, rank, pickHidden, pickTeamName }: Props) {
  const alive = member.status === 'ALIVE';

  return (
    <View style={[styles.row, !alive && styles.rowElim]}>
      <Text style={styles.rank}>#{rank}</Text>

      <View style={[styles.avatar, alive ? styles.avatarAlive : styles.avatarElim]}>
        <Text style={styles.avatarText}>
          {(member.displayName[0] ?? '?').toUpperCase()}
        </Text>
      </View>

      <View style={styles.info}>
        <Text style={[styles.name, !alive && styles.nameElim]}>{member.displayName}</Text>
        <Text style={styles.meta}>
          {alive
            ? `${member.roundsSurvived} round${member.roundsSurvived !== 1 ? 's' : ''} survived`
            : `Out round ${member.eliminatedRound ?? '?'}`}
        </Text>
      </View>

      {alive ? (
        <Text style={styles.pick}>
          {pickHidden ? '??' : (pickTeamName ?? '—')}
        </Text>
      ) : (
        <Text style={styles.elimTag}>ELIMINATED</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  rowElim: { opacity: 0.5 },
  rank: { width: 28, fontSize: Typography.sm, color: Colors.textMuted, textAlign: 'right' },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarAlive: { backgroundColor: Colors.primary + '30' },
  avatarElim: { backgroundColor: Colors.danger + '20' },
  avatarText: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.text },
  info: { flex: 1 },
  name: { fontSize: Typography.base, fontWeight: Typography.semibold, color: Colors.text },
  nameElim: { color: Colors.textSecondary },
  meta: { fontSize: Typography.xs, color: Colors.textMuted, marginTop: 1 },
  pick: { fontSize: Typography.sm, fontWeight: Typography.semibold, color: Colors.primary },
  elimTag: { fontSize: 10, fontWeight: '700', color: Colors.danger, letterSpacing: 0.5 },
});
