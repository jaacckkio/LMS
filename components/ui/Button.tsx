import React, { useRef } from 'react';
import {
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Animated,
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
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 50 }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 50 }).start();
  };

  const handlePress = () => {
    if (haptic) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        style={[styles.base, styles[variant], styles[`sz_${size}`], (disabled || loading) && styles.disabled, style]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={1}
      >
        {loading ? (
          <ActivityIndicator color={variant === 'primary' ? Colors.background : Colors.primary} size="small" />
        ) : (
          <Text style={[styles.text, styles[`text_${variant}`], styles[`textSz_${size}`], textStyle]}>
            {title}
          </Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  primary: { backgroundColor: Colors.primary },
  secondary: { backgroundColor: Colors.surfaceElevated, borderWidth: 1, borderColor: Colors.border },
  ghost: { backgroundColor: 'transparent' },
  danger: { backgroundColor: Colors.danger },
  sz_sm: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.base },
  sz_md: { paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg },
  sz_lg: { paddingVertical: Spacing.base + 2, paddingHorizontal: Spacing.xl },
  disabled: { opacity: 0.4 },
  text: { fontWeight: Typography.semibold },
  text_primary: { color: Colors.background },
  text_secondary: { color: Colors.text },
  text_ghost: { color: Colors.primary },
  text_danger: { color: Colors.text },
  textSz_sm: { fontSize: Typography.sm },
  textSz_md: { fontSize: Typography.base },
  textSz_lg: { fontSize: Typography.md },
});
