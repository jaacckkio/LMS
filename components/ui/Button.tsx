import React from 'react';
import {
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Radius, Spacing } from '../../constants/theme';
import { Text } from './Text';

interface Props {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  haptic?: boolean;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'lg',
  loading = false,
  disabled = false,
  style,
  textStyle,
  haptic = true,
}: Props) {
  const handlePress = () => {
    if (haptic) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onPress();
  };

  return (
    <TouchableOpacity
      style={[
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        (disabled || loading) && styles.disabled,
        style,
      ]}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.85}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? Colors.text : Colors.accent} size="small" />
      ) : (
        <Text
          style={[
            styles.text,
            styles[`text_${variant}`],
            styles[`textSize_${size}`],
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: { backgroundColor: Colors.accent },
  secondary: { backgroundColor: Colors.surfaceElevated, borderWidth: 1, borderColor: Colors.border },
  ghost: { backgroundColor: 'transparent' },
  danger: { backgroundColor: Colors.error },
  size_sm: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.base },
  size_md: { paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg },
  size_lg: { paddingVertical: Spacing.base, paddingHorizontal: Spacing.xl },
  disabled: { opacity: 0.45 },
  text: { fontWeight: Typography.semibold },
  text_primary: { color: Colors.text },
  text_secondary: { color: Colors.text },
  text_ghost: { color: Colors.accent },
  text_danger: { color: Colors.text },
  textSize_sm: { fontSize: Typography.sm },
  textSize_md: { fontSize: Typography.base },
  textSize_lg: { fontSize: Typography.md },
});
