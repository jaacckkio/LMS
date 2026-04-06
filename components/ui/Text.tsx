import React from 'react';
import { Text as RNText, TextProps, StyleSheet } from 'react-native';
import { Colors, Typography } from '../../constants/theme';

interface Props extends TextProps {
  variant?: 'display' | 'heading' | 'subheading' | 'body' | 'caption' | 'label';
  color?: string;
  weight?: 'regular' | 'medium' | 'semibold' | 'bold' | 'extrabold';
}

export function Text({ variant = 'body', color, weight, style, ...props }: Props) {
  return (
    <RNText
      style={[styles.base, styles[variant], weight && styles[weight], color ? { color } : null, style]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    color: Colors.text,
    fontFamily: 'System',
  },
  display: { fontSize: Typography['4xl'], fontWeight: Typography.extrabold, letterSpacing: -1.5 },
  heading: { fontSize: Typography['2xl'], fontWeight: Typography.bold, letterSpacing: -0.5 },
  subheading: { fontSize: Typography.lg, fontWeight: Typography.semibold },
  body: { fontSize: Typography.base, fontWeight: Typography.regular, lineHeight: 22 },
  caption: { fontSize: Typography.sm, fontWeight: Typography.regular, lineHeight: 18 },
  label: { fontSize: Typography.xs, fontWeight: Typography.semibold, letterSpacing: 0.5, textTransform: 'uppercase' },
  regular: { fontWeight: Typography.regular },
  medium: { fontWeight: Typography.medium },
  semibold: { fontWeight: Typography.semibold },
  bold: { fontWeight: Typography.bold },
  extrabold: { fontWeight: Typography.extrabold },
});
