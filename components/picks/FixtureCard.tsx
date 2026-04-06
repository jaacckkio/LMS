import React, { useRef, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, Text } from 'react-native';
import { TeamCrest } from '../ui/TeamCrest';
import { Colors, Spacing, Radius, Typography } from '../../constants/theme';
import { ApiMatch } from '../../types';
import { isMatchLocked, toLondonTimeShort } from '../../lib/api';

interface Props {
  match: ApiMatch;
  selectedTeamTla: string | null;
  usedTeamTlas: string[];
  resetTeamTlas: string[];   // teams available again after a reset
  onSelectTeam: (tla: string) => void;
  disabled?: boolean;
}

export function FixtureCard({
  match,
  selectedTeamTla,
  usedTeamTlas,
  resetTeamTlas,
  onSelectTeam,
  disabled = false,
}: Props) {
  const locked = isMatchLocked(match.utcDate) || disabled;
  const isLive =
    match.status === 'IN_PLAY' || match.status === 'PAUSED';
  const isFinished = match.status === 'FINISHED';

  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isLive) return;
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.3, duration: 600, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [isLive, pulse]);

  function getState(tla: string) {
    if (selectedTeamTla === tla) return 'selected' as const;
    if (usedTeamTlas.includes(tla) && !resetTeamTlas.includes(tla)) return 'used' as const;
    if (resetTeamTlas.includes(tla)) return 'reset' as const;
    return 'default' as const;
  }

  function canPick(tla: string) {
    if (locked) return false;
    const s = getState(tla);
    return s === 'default' || s === 'selected' || s === 'reset';
  }

  const { homeTeam, awayTeam } = match;
  const homeState = getState(homeTeam.tla);
  const awayState = getState(awayTeam.tla);

  const centreContent = () => {
    if (isLive) {
      return (
        <View style={styles.liveBlock}>
          <Animated.View style={[styles.liveDot, { opacity: pulse }]} />
          <Text style={styles.liveScore}>
            {match.score.fullTime.home ?? 0} – {match.score.fullTime.away ?? 0}
          </Text>
        </View>
      );
    }
    if (isFinished) {
      return (
        <Text style={styles.score}>
          {match.score.fullTime.home} – {match.score.fullTime.away}
        </Text>
      );
    }
    return <Text style={styles.time}>{toLondonTimeShort(match.utcDate)}</Text>;
  };

  return (
    <View style={[styles.card, locked && styles.cardLocked]}>
      <TeamSide
        team={homeTeam}
        state={homeState}
        onPress={() => canPick(homeTeam.tla) && onSelectTeam(homeTeam.tla)}
        side="home"
      />

      <View style={styles.centre}>{centreContent()}</View>

      <TeamSide
        team={awayTeam}
        state={awayState}
        onPress={() => canPick(awayTeam.tla) && onSelectTeam(awayTeam.tla)}
        side="away"
      />
    </View>
  );
}

function TeamSide({
  team,
  state,
  onPress,
  side,
}: {
  team: ApiMatch['homeTeam'];
  state: 'default' | 'used' | 'selected' | 'reset' | 'eliminated';
  onPress: () => void;
  side: 'home' | 'away';
}) {
  const isSelected = state === 'selected';
  const isUsed = state === 'used';

  return (
    <TouchableOpacity
      style={[
        styles.side,
        isSelected && styles.sideSelected,
        side === 'away' && styles.sideAway,
      ]}
      onPress={onPress}
      activeOpacity={0.75}
      disabled={isUsed}
    >
      <TeamCrest uri={team.crest} size={52} state={state} />
      <Text style={[styles.tla, isUsed && styles.tlaUsed]}>{team.tla}</Text>
      {isUsed && <Text style={styles.usedTag}>Used</Text>}
      {state === 'reset' && <Text style={styles.resetTag}>Reset</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  cardLocked: { opacity: 0.6 },
  side: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    gap: 6,
  },
  sideAway: {},
  sideSelected: {
    backgroundColor: Colors.primary + '18',
    borderWidth: 1.5,
    borderColor: Colors.primary + '80',
    borderRadius: Radius.lg,
    margin: 2,
  },
  tla: {
    fontSize: Typography.sm,
    fontWeight: Typography.bold,
    color: Colors.text,
    letterSpacing: 0.5,
  },
  tlaUsed: { color: Colors.textMuted },
  usedTag: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '600',
    textDecorationLine: 'line-through',
    textDecorationColor: Colors.textMuted,
  },
  resetTag: {
    fontSize: 10,
    color: Colors.gold,
    fontWeight: '700',
  },
  centre: {
    width: 72,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  liveBlock: { alignItems: 'center', gap: 4 },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: Colors.primary,
  },
  liveScore: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary,
    fontVariant: ['tabular-nums'],
  },
  score: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
    fontVariant: ['tabular-nums'],
  },
  time: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    fontVariant: ['tabular-nums'],
  },
});
