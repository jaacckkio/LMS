import React from 'react';
import { Text as RNText, TextProps, StyleSheet } from 'react-native';
import { Colors, Typography } from '../../constants/theme';

interface Props extends TextProps {
  variant?: 'display' | 'heading' | 'subheading' | 'body' | 'caption' | 'label' | 'mono';
  color?: string;
  weight?: 'regular' | 'medium' | 'semibold' | 'bold' | 'extrabold';
}

export function Text({ variant = 'body', color, weight, style, ...props }: Props) {
  return (
    <RNText
      style={[
        styles.base,
        styles[variant],
        weight && styles[`w_${weight}`],
        color ? { color } : null,
        style,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  base: { color: Colors.text },
  display: { fontSize: Typography['4xl'], fontWeight: Typography.extrabold, letterSpacing: -1.5 },
  heading: { fontSize: Typography['2xl'], fontWeight: Typography.bold, letterSpacing: -0.5 },
  subheading: { fontSize: Typography.lg, fontWeight: Typography.semibold },
  body: { fontSize: Typography.base, fontWeight: Typography.regular, lineHeight: 22 },
  caption: { fontSize: Typography.sm, fontWeight: Typography.regular, lineHeight: 18 },
  label: { fontSize: Typography.xs, fontWeight: Typography.semibold, letterSpacing: 0.8, textTransform: 'uppercase' },
  mono: { fontSize: Typography.base, fontFamily: 'monospace', fontVariant: ['tabular-nums'] },
  w_regular: { fontWeight: Typography.regular },
  w_medium: { fontWeight: Typography.medium },
  w_semibold: { fontWeight: Typography.semibold },
  w_bold: { fontWeight: Typography.bold },
  w_extrabold: { fontWeight: Typography.extrabold },
});
