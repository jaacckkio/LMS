import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Colors, Radius } from '../../constants/theme';

type State = 'default' | 'used' | 'selected' | 'reset' | 'eliminated';

interface Props {
  uri: string;
  size?: number;
  state?: State;
}

const RING: Record<State, string | null> = {
  default: null,
  used: Colors.textMuted,
  selected: Colors.primary,
  reset: Colors.gold,
  eliminated: Colors.danger,
};

export function TeamCrest({ uri, size = 40, state = 'default' }: Props) {
  const ring = RING[state];
  const dimmed = state === 'used' || state === 'eliminated';

  return (
    <View
      style={[
        styles.container,
        { width: size, height: size, borderRadius: size / 2 },
        ring ? { borderColor: ring, borderWidth: 2 } : null,
      ]}
    >
      <Image
        source={{ uri }}
        style={[
          { width: size * 0.72, height: size * 0.72 },
          dimmed && styles.dimmed,
        ]}
        contentFit="contain"
        transition={150}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  dimmed: { opacity: 0.3 },
});
