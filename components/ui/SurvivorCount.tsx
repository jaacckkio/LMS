import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Colors, Typography, Fonts } from '../../constants/theme';

interface Props {
  alive: number;
  eliminated: number;
  /** Optional compact mode — single line instead of two-line block. */
  compact?: boolean;
}

/**
 * Two-line stat block:
 *   Line 1 (display, large): "1,203 SURVIVORS"
 *   Line 2 (small, red):     "17,217 eliminated"
 * Used in LeagueCard, Home dashboard, etc.
 */
export function SurvivorCount({ alive, eliminated, compact = false }: Props) {
  const aliveFormatted = alive.toLocaleString();
  const elimFormatted = eliminated.toLocaleString();

  if (compact) {
    return (
      <Text style={styles.compactLine}>
        <Text style={styles.compactAlive}>{aliveFormatted}</Text>
        <Text style={styles.compactSep}> / </Text>
        <Text style={styles.compactElim}>{elimFormatted} out</Text>
      </Text>
    );
  }

  return (
    <View style={styles.block}>
      <Text style={styles.aliveLine}>
        {aliveFormatted}{' '}
        <Text style={styles.aliveLabel}>SURVIVORS</Text>
      </Text>
      <Text style={styles.elimLine}>
        {elimFormatted} eliminated
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  block: { gap: 2 },
  aliveLine: {
    fontSize: Typography.lg,
    fontWeight: '800',
    fontFamily: Fonts.display,
    color: Colors.text,
    fontVariant: ['tabular-nums'],
    letterSpacing: 0.5,
  },
  aliveLabel: {
    fontSize: Typography.sm,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 1,
  },
  elimLine: {
    fontSize: Typography.sm,
    fontWeight: '600',
    color: Colors.danger,
    fontVariant: ['tabular-nums'],
  },
  compactLine: { fontSize: Typography.sm, fontVariant: ['tabular-nums'] },
  compactAlive: { fontWeight: '700', color: Colors.primary },
  compactSep: { color: Colors.textMuted },
  compactElim: { fontWeight: '600', color: Colors.danger },
});
