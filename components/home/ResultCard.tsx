import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '../ui/Text';
import { Card } from '../ui/Card';
import { TeamCrest } from '../ui/TeamCrest';
import { Colors, Spacing } from '../../constants/theme';
import { getTeamById } from '../../constants/teams';

interface Props {
  teamId: string;
  result: 'survived' | 'eliminated';
  gameweek: number;
  streak: number;
}

export function ResultCard({ teamId, result, gameweek, streak }: Props) {
  const team = getTeamById(teamId);
  const survived = result === 'survived';

  return (
    <Card
      elevated
      style={[styles.card, survived ? styles.survivedCard : styles.eliminatedCard]}
    >
      <View style={styles.row}>
        {team && <TeamCrest uri={team.crest} size={52} />}
        <View style={styles.info}>
          <Text variant="label" color={survived ? Colors.alive : Colors.error}>
            {survived ? 'Survived' : 'Eliminated'}
          </Text>
          <Text variant="subheading">
            {team?.name ?? teamId} — GW{gameweek}
          </Text>
          {survived && (
            <Text variant="caption" color={Colors.textSecondary}>
              {streak} week streak alive
            </Text>
          )}
        </View>
        <Text style={styles.icon}>{survived ? '✓' : '✕'}</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: Spacing.md },
  survivedCard: { borderColor: Colors.alive + '60' },
  eliminatedCard: { borderColor: Colors.error + '60' },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  info: { flex: 1, gap: 2 },
  icon: { fontSize: 28, fontWeight: '700' },
});
