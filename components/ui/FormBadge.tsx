import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from './Text';
import { Colors, Radius } from '../../constants/theme';
import type { FormResult } from '../../types';

interface Props {
  result: FormResult;
  size?: 'sm' | 'md';
}

export function FormBadge({ result, size = 'sm' }: Props) {
  return (
    <View style={[styles.base, styles[result], size === 'md' && styles.md]}>
      <Text style={[styles.text, size === 'md' && styles.textMd]}>{result}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    width: 20,
    height: 20,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  md: { width: 26, height: 26 },
  W: { backgroundColor: Colors.success },
  D: { backgroundColor: Colors.warning },
  L: { backgroundColor: Colors.error },
  text: { fontSize: 10, fontWeight: '700', color: Colors.text },
  textMd: { fontSize: 12 },
});
