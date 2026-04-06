import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { TeamCrest } from '../ui/TeamCrest';
import { Colors, Spacing } from '../../constants/theme';
import { GuestPick } from '../../types';
import { ApiTeam } from '../../types';

interface Props {
  teams: ApiTeam[];
  picks: GuestPick[];
  resetTeamTlas: string[];
}

export function TeamGrid({ teams, picks, resetTeamTlas }: Props) {
  const pickMap = new Map(picks.map((p) => [p.teamId, p]));

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Teams This Season</Text>
      <View style={styles.grid}>
        {teams.map((team) => {
          const pick = pickMap.get(team.tla);
          const isReset = resetTeamTlas.includes(team.tla);

          let state: 'default' | 'used' | 'reset' | 'eliminated' = 'default';
          if (pick) {
            if (isReset) {
              state = 'reset';
            } else if (pick.result === 'WIN' || pick.result === 'DRAW') {
              state = 'used';
            } else if (pick.result === 'LOSS') {
              state = 'eliminated';
            } else {
              state = 'used';
            }
          }

          return (
            <View key={team.tla} style={styles.cell}>
              <TeamCrest uri={team.crest} size={38} state={state} />
              <Text style={[styles.tla, !pick && styles.tlaUnused]}>{team.tla}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: Spacing.xl },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: Spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  cell: { alignItems: 'center', gap: 4, width: 44 },
  tla: { fontSize: 9, fontWeight: '700', color: Colors.textSecondary, textAlign: 'center' },
  tlaUnused: { color: Colors.textMuted },
});
