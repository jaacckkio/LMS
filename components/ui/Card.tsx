import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { Colors, Radius, Spacing } from '../../constants/theme';

interface Props extends ViewProps {
  elevated?: boolean;
}

export function Card({ elevated = false, style, children, ...props }: Props) {
  return (
    <View
      style={[styles.base, elevated && styles.elevated, style]}
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
  elevated: {
    backgroundColor: Colors.surfaceElevated,
  },
});
