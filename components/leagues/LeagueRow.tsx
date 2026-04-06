import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Text } from '../ui/Text';
import { Colors, Spacing, Radius } from '../../constants/theme';
import type { League } from '../../types';

interface Props {
  league: League;
  onPress: () => void;
}

export function LeagueRow({ league, onPress }: Props) {
  const pct = league.totalMembers > 0
    ? Math.round((league.aliveMembers / league.totalMembers) * 100)
    : 0;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.info}>
        <Text variant="subheading">{league.name}</Text>
        <Text variant="caption" color={Colors.textSecondary} style={styles.code}>
          {league.isGlobal ? 'Global Pool' : `#${league.joinCode}`}
        </Text>
      </View>
      <View style={styles.right}>
        <Text style={styles.survivors}>
          <Text weight="bold" color={Colors.alive}>{league.aliveMembers}</Text>
          <Text color={Colors.textMuted}>/{league.totalMembers}</Text>
        </Text>
        <Text variant="caption" color={Colors.textSecondary}>remaining</Text>
      </View>
      <Text style={styles.arrow} color={Colors.textMuted}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.base,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  info: { flex: 1, gap: 2 },
  code: { marginTop: 2 },
  right: { alignItems: 'flex-end', gap: 2 },
  survivors: { fontSize: 16 },
  arrow: { fontSize: 22, fontWeight: '300' },
});
