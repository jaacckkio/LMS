import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Text } from 'react-native';
import { CountdownTimer } from './CountdownTimer';
import { Colors, Spacing, Typography, Fonts } from '../../constants/theme';
import { toLondonTime } from '../../lib/api';

interface Props {
  roundName: string;
  deadline: Date | null;
  /** Subtitle override. Defaults to "Picks lock <deadline>". */
  subtitle?: string;
}

/**
 * "GAMEWEEK 12" tracked caps + huge countdown + lock subtitle.
 * Pulses the countdown when < 1 hour to deadline.
 */
export function GameweekHeader({ roundName, deadline, subtitle }: Props) {
  const pulseOpacity = useRef(new Animated.Value(1)).current;
  const pulseRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (!deadline) return;

    const msRemaining = deadline.getTime() - Date.now();
    const oneHour = 60 * 60 * 1000;

    if (msRemaining > 0 && msRemaining < oneHour) {
      startPulse();
    } else if (msRemaining > 0) {
      // Schedule pulse start when we cross the 1h threshold
      const delay = msRemaining - oneHour;
      if (delay > 0) {
        const timer = setTimeout(startPulse, delay);
        return () => {
          clearTimeout(timer);
          stopPulse();
        };
      }
    }

    return () => stopPulse();
  }, [deadline]);

  function startPulse() {
    pulseRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseOpacity, { toValue: 0.6, duration: 750, useNativeDriver: true }),
        Animated.timing(pulseOpacity, { toValue: 1, duration: 750, useNativeDriver: true }),
      ]),
    );
    pulseRef.current.start();
  }

  function stopPulse() {
    if (pulseRef.current) {
      pulseRef.current.stop();
      pulseRef.current = null;
    }
    pulseOpacity.setValue(1);
  }

  const lockText = deadline
    ? subtitle ?? `Picks lock ${toLondonTime(deadline.toISOString())}`
    : subtitle ?? '';

  return (
    <View style={styles.container}>
      <Text style={styles.roundName}>{roundName.toUpperCase()}</Text>

      {deadline && (
        <Animated.View style={{ opacity: pulseOpacity }}>
          <CountdownTimer deadline={deadline} size="lg" />
        </Animated.View>
      )}

      {lockText ? (
        <Text style={styles.subtitle}>{lockText}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  roundName: {
    fontSize: Typography.sm,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 1.5,
    fontFamily: Fonts.display,
  },
  subtitle: {
    fontSize: Typography.sm,
    fontWeight: '600',
    color: Colors.textMuted,
    textAlign: 'center',
  },
});
