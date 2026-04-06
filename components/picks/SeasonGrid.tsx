import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '../ui/Text';
import { TeamCrest } from '../ui/TeamCrest';
import { Colors, Spacing, Radius } from '../../constants/theme';
import { PL_TEAMS } from '../../constants/teams';
import type { Pick } from '../../types';

interface Props {
  picks: Pick[];
}

export function SeasonGrid({ picks }: Props) {
  const usedMap = new Map(picks.map((p) => [p.teamId, p.gameweek]));

  return (
    <View>
      <Text variant="label" color={Colors.textSecondary} style={styles.sectionLabel}>
        My Picks This Season
      </Text>
      <View style={styles.grid}>
        {PL_TEAMS.map((team) => {
          const week = usedMap.get(team.id);
          return (
            <View key={team.id} style={styles.cell}>
              <TeamCrest uri={team.crest} size={40} dimmed={!week} />
              {week ? (
                <Text style={styles.weekLabel}>W{week}</Text>
              ) : (
                <Text style={styles.unusedLabel}>—</Text>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionLabel: { marginBottom: Spacing.md },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  cell: {
    alignItems: 'center',
    gap: 4,
    width: 48,
  },
  weekLabel: { fontSize: 10, fontWeight: '700', color: Colors.accent },
  unusedLabel: { fontSize: 10, color: Colors.textMuted },
});
