import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Colors, Radius } from '../../constants/theme';

interface Props {
  uri: string;
  size?: number;
  dimmed?: boolean;
}

export function TeamCrest({ uri, size = 40, dimmed = false }: Props) {
  return (
    <View style={[styles.container, { width: size, height: size }, dimmed && styles.dimmed]}>
      <Image
        source={{ uri }}
        style={{ width: size * 0.8, height: size * 0.8 }}
        contentFit="contain"
        transition={200}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceElevated,
  },
  dimmed: { opacity: 0.35 },
});
