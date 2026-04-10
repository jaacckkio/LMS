import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, StyleSheet, Animated, Text } from 'react-native';
import { Colors, Spacing, Typography } from '../../constants/theme';

interface Props {
  items: string[];
  /** Seconds between rotations. Default 4. */
  interval?: number;
}

const SLIDE_DURATION = 300;

/**
 * Auto-rotating stat ticker strip.
 *
 * Animation: discrete Animated.timing transitions tied to a data swap,
 * not Animated.loop. On cleanup: clearInterval + stopAnimation.
 * useNativeDriver: true on the slide.
 */
export function LiveTicker({ items, interval = 4 }: Props) {
  const [index, setIndex] = useState(0);
  const translateY = useRef(new Animated.Value(0)).current;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const advance = useCallback(() => {
    // Slide out upward
    Animated.timing(translateY, {
      toValue: -20,
      duration: SLIDE_DURATION,
      useNativeDriver: true,
    }).start(() => {
      // Swap text while off-screen, position below
      setIndex((prev) => (prev + 1) % items.length);
      translateY.setValue(20);

      // Slide in from below
      Animated.timing(translateY, {
        toValue: 0,
        duration: SLIDE_DURATION,
        useNativeDriver: true,
      }).start();
    });
  }, [items.length, translateY]);

  useEffect(() => {
    if (items.length <= 1) return;

    intervalRef.current = setInterval(advance, interval * 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      translateY.stopAnimation();
    };
  }, [items.length, interval, advance, translateY]);

  if (items.length === 0) return null;

  return (
    <View style={styles.container}>
      <Animated.View style={{ transform: [{ translateY }] }}>
        <Text style={styles.text} numberOfLines={1}>
          {items[index]}
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 24,
    overflow: 'hidden',
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm,
  },
  text: {
    fontSize: Typography.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
