import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { Colors, Radius, Spacing } from '../../constants/theme';

interface Props extends ViewProps {
  elevated?: boolean;
  noPadding?: boolean;
}

export function Card({ elevated = false, noPadding = false, style, children, ...props }: Props) {
  return (
    <View
      style={[styles.base, elevated && styles.elevated, noPadding && styles.noPadding, style]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  elevated: { backgroundColor: Colors.surfaceElevated },
  noPadding: { padding: 0 },
});
