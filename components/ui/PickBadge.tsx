import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Image } from 'expo-image';
import { Colors, Radius, Spacing } from '../../constants/theme';
import { PickResult } from '../../types';

interface Props {
  teamName: string;
  teamCrest: string;
  result: PickResult;
  roundLabel?: string;
}

const BG: Record<PickResult, string> = {
  WIN: Colors.primary + '20',
  LOSS: Colors.danger + '20',
  DRAW: Colors.warning + '20',
  PENDING: Colors.surfaceElevated,
};

const BORDER: Record<PickResult, string> = {
  WIN: Colors.primary + '60',
  LOSS: Colors.danger + '60',
  DRAW: Colors.warning + '60',
  PENDING: Colors.border,
};

const LABEL: Record<PickResult, string> = {
  WIN: 'WIN',
  LOSS: 'ELIMINATED',
  DRAW: 'SURVIVED',   // Draw = survival per spec
  PENDING: 'PENDING',
};

const LABEL_COLOR: Record<PickResult, string> = {
  WIN: Colors.primary,
  LOSS: Colors.danger,
  DRAW: Colors.warning,
  PENDING: Colors.textMuted,
};

export function PickBadge({ teamName, teamCrest, result, roundLabel }: Props) {
  return (
    <View style={[styles.container, { backgroundColor: BG[result], borderColor: BORDER[result] }]}>
      <Image source={{ uri: teamCrest }} style={styles.crest} contentFit="contain" />
      <View style={styles.info}>
        <Text style={styles.team}>{teamName}</Text>
        {roundLabel && <Text style={styles.round}>{roundLabel}</Text>}
      </View>
      <Text style={[styles.result, { color: LABEL_COLOR[result] }]}>{LABEL[result]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: Spacing.sm,
    gap: Spacing.sm,
  },
  crest: { width: 28, height: 28 },
  info: { flex: 1 },
  team: { fontSize: 14, fontWeight: '600', color: Colors.text },
  round: { fontSize: 11, color: Colors.textSecondary, marginTop: 1 },
  result: { fontSize: 11, fontWeight: '700' },
});
