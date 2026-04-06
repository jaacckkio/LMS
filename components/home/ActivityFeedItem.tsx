import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Colors, Spacing, Typography } from '../../constants/theme';
import { PickResult } from '../../types';

interface Props {
  username: string;
  teamName: string;
  teamTla: string;
  result: PickResult;
  roundName: string;
  timeAgo?: string;
}

const DOT: Record<PickResult, string> = {
  WIN: Colors.primary,
  DRAW: Colors.warning,
  LOSS: Colors.danger,
  PENDING: Colors.textMuted,
};

const ACTION: Record<PickResult, string> = {
  WIN: 'survived with',
  DRAW: 'survived (draw) with',
  LOSS: 'was eliminated with',
  PENDING: 'picked',
};

export function ActivityFeedItem({ username, teamName, result, roundName, timeAgo }: Props) {
  return (
    <View style={styles.row}>
      <View style={[styles.dot, { backgroundColor: DOT[result] }]} />
      <View style={styles.info}>
        <Text style={styles.text} numberOfLines={1}>
          <Text style={styles.username}>{username}</Text>
          <Text style={styles.action}> {ACTION[result]} </Text>
          <Text style={styles.team}>{teamName}</Text>
        </Text>
        <Text style={styles.meta}>
          {roundName}{timeAgo ? ` · ${timeAgo}` : ''}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dot: { width: 8, height: 8, borderRadius: 4, marginTop: 5 },
  info: { flex: 1 },
  text: { fontSize: Typography.base, lineHeight: 20 },
  username: { fontWeight: Typography.semibold, color: Colors.text },
  action: { color: Colors.textSecondary },
  team: { fontWeight: Typography.semibold, color: Colors.text },
  meta: { fontSize: Typography.xs, color: Colors.textMuted, marginTop: 2 },
});
