import React from 'react';
import { ScrollView, View, StyleSheet, Text } from 'react-native';
import { Image } from 'expo-image';
import { ApiMatch } from '../../types';
import { toLondonTimeShort } from '../../lib/api';
import { Colors, Radius, Spacing, Typography } from '../../constants/theme';

interface Props {
  matches: ApiMatch[];
}

export function FixtureRow({ matches }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {matches.map((m) => (
        <MatchChip key={m.id} match={m} />
      ))}
    </ScrollView>
  );
}

function MatchChip({ match }: { match: ApiMatch }) {
  const isLive = match.status === 'IN_PLAY' || match.status === 'PAUSED';
  const isFinished = match.status === 'FINISHED';
  const showScore = isLive || isFinished;

  const centreText = showScore
    ? `${match.score.fullTime.home ?? 0} – ${match.score.fullTime.away ?? 0}`
    : toLondonTimeShort(match.utcDate);

  return (
    <View style={[styles.chip, isLive && styles.chipLive]}>
      <TeamIcon crest={match.homeTeam.crest} tla={match.homeTeam.tla} />
      <View style={styles.centre}>
        {isLive && <Text style={styles.liveLabel}>LIVE</Text>}
        <Text style={[styles.centre_text, isLive && styles.liveScore]}>{centreText}</Text>
      </View>
      <TeamIcon crest={match.awayTeam.crest} tla={match.awayTeam.tla} />
    </View>
  );
}

function TeamIcon({ crest, tla }: { crest: string; tla: string }) {
  return (
    <View style={styles.teamIcon}>
      <Image source={{ uri: crest }} style={styles.crest} contentFit="contain" />
      <Text style={styles.tla}>{tla}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    minWidth: 160,
  },
  chipLive: {
    borderColor: Colors.primary + '60',
    backgroundColor: Colors.primary + '08',
  },
  teamIcon: { alignItems: 'center', gap: 4 },
  crest: { width: 28, height: 28 },
  tla: { fontSize: 9, fontWeight: '700', color: Colors.textSecondary, letterSpacing: 0.5 },
  centre: { flex: 1, alignItems: 'center' },
  centre_text: {
    fontSize: Typography.base,
    fontWeight: Typography.bold,
    color: Colors.text,
    fontVariant: ['tabular-nums'],
  },
  liveLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 1,
  },
  liveScore: { color: Colors.primary },
});
