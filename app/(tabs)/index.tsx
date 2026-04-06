/**
 * Home Screen — contextual: shows countdown before deadline, results after matchday
 */
import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Text } from '../../components/ui/Text';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { CountdownCard } from '../../components/home/CountdownCard';
import { ResultCard } from '../../components/home/ResultCard';
import { TeamCrest } from '../../components/ui/TeamCrest';
import { Colors, Spacing, Radius } from '../../constants/theme';
import { getTeamById } from '../../constants/teams';
import { useAuth } from '../../hooks/useAuth';

// Demo state toggle for showing before/after deadline states
type HomeState = 'before_deadline' | 'after_matchday';

// Mock data — replace with Supabase queries
const MOCK_DEADLINE = new Date(Date.now() + 36 * 60 * 60 * 1000); // 36h from now
const MOCK_STREAK = 6;
const MOCK_PICK_THIS_WEEK = 'LIV';
const MOCK_LAST_RESULT = { teamId: 'LIV', result: 'survived' as const, gameweek: 30 };

const MOCK_FEED = [
  { username: 'jamie_fc', teamId: 'ARS', result: 'survived', gameweek: 30 },
  { username: 'sarah_k', teamId: 'MCI', result: 'eliminated', gameweek: 30 },
  { username: 'pedro99', teamId: 'TOT', result: 'survived', gameweek: 30 },
  { username: 'kate_lfc', teamId: 'LIV', result: 'survived', gameweek: 30 },
  { username: 'dan_united', teamId: 'MNU', result: 'eliminated', gameweek: 30 },
];

export default function HomeScreen() {
  const { user } = useAuth();
  const [demoState, setDemoState] = useState<HomeState>('before_deadline');

  const beforeDeadline = demoState === 'before_deadline';
  const displayName = user?.displayName ?? user?.email?.split('@')[0] ?? 'Player';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text variant="caption" color={Colors.textSecondary}>Welcome back</Text>
            <Text variant="subheading">{displayName}</Text>
          </View>
          <View style={styles.streakBadge}>
            <Text style={styles.streakFire}>🔥</Text>
            <Text style={styles.streakCount}>{MOCK_STREAK}</Text>
          </View>
        </View>

        {/* Demo toggle — remove in production */}
        <TouchableOpacity
          onPress={() => setDemoState(beforeDeadline ? 'after_matchday' : 'before_deadline')}
          style={styles.demoToggle}
        >
          <Text variant="caption" color={Colors.textMuted}>
            Demo: {beforeDeadline ? 'Before deadline' : 'After matchday'} — tap to toggle
          </Text>
        </TouchableOpacity>

        {beforeDeadline ? (
          <BeforeDeadlineContent />
        ) : (
          <AfterMatchdayContent />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function BeforeDeadlineContent() {
  const currentPickTeam = getTeamById(MOCK_PICK_THIS_WEEK);

  return (
    <>
      <CountdownCard deadline={MOCK_DEADLINE} gameweek={31} />

      {/* Current pick or CTA */}
      {currentPickTeam ? (
        <Card elevated style={styles.currentPick}>
          <Text variant="label" color={Colors.alive}>Pick Locked</Text>
          <View style={styles.pickRow}>
            <TeamCrest uri={currentPickTeam.crest} size={44} />
            <View>
              <Text variant="subheading">{currentPickTeam.name}</Text>
              <Text variant="caption" color={Colors.textSecondary}>Gameweek 31</Text>
            </View>
            <View style={styles.pickCheck}>
              <Text style={styles.pickCheckIcon}>✓</Text>
            </View>
          </View>
        </Card>
      ) : (
        <Card elevated style={styles.ctaCard}>
          <Text variant="subheading">Make Your Pick</Text>
          <Text variant="body" color={Colors.textSecondary} style={styles.ctaBody}>
            You haven't picked yet this week. Don't get caught out!
          </Text>
          <Button
            title="Pick Now"
            onPress={() => router.push('/(tabs)/pick')}
            style={styles.ctaBtn}
          />
        </Card>
      )}

      {/* League activity */}
      <View style={styles.section}>
        <Text variant="label" color={Colors.textSecondary} style={styles.sectionLabel}>
          League Activity
        </Text>
        {MOCK_FEED.slice(0, 3).map((item, i) => (
          <FeedItem key={i} {...item} />
        ))}
      </View>
    </>
  );
}

function AfterMatchdayContent() {
  return (
    <>
      <ResultCard
        teamId={MOCK_LAST_RESULT.teamId}
        result={MOCK_LAST_RESULT.result}
        gameweek={MOCK_LAST_RESULT.gameweek}
        streak={MOCK_STREAK}
      />

      <Card elevated style={styles.ctaCard}>
        <Text variant="subheading">Gameweek 31 is open</Text>
        <Text variant="body" color={Colors.textSecondary} style={styles.ctaBody}>
          Picks are now open. You have 36 hours to lock in.
        </Text>
        <Button
          title="Make Your Pick"
          onPress={() => router.push('/(tabs)/pick')}
          style={styles.ctaBtn}
        />
      </Card>

      <View style={styles.section}>
        <Text variant="label" color={Colors.textSecondary} style={styles.sectionLabel}>
          GW30 Results — Your Leagues
        </Text>
        {MOCK_FEED.map((item, i) => (
          <FeedItem key={i} {...item} />
        ))}
      </View>
    </>
  );
}

function FeedItem({
  username,
  teamId,
  result,
  gameweek,
}: {
  username: string;
  teamId: string;
  result: string;
  gameweek: number;
}) {
  const team = getTeamById(teamId);
  const survived = result === 'survived';

  return (
    <View style={styles.feedItem}>
      <View style={[styles.feedDot, survived ? styles.feedDotAlive : styles.feedDotElim]} />
      <TeamCrest uri={team?.crest ?? ''} size={28} />
      <View style={styles.feedInfo}>
        <Text style={styles.feedUsername}>{username}</Text>
        <Text variant="caption" color={survived ? Colors.alive : Colors.error}>
          {survived ? 'Survived' : 'Eliminated'} · {team?.shortName} · GW{gameweek}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.base, paddingBottom: Spacing['4xl'], gap: Spacing.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  streakFire: { fontSize: 16 },
  streakCount: { fontSize: 18, fontWeight: '800', color: Colors.text },
  demoToggle: {
    backgroundColor: Colors.navy,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  currentPick: { borderColor: Colors.alive + '40' },
  pickRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginTop: Spacing.sm },
  pickCheck: {
    marginLeft: 'auto',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.alive + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickCheckIcon: { fontSize: 18, color: Colors.alive },
  ctaCard: {},
  ctaBody: { marginTop: Spacing.xs, marginBottom: Spacing.md, lineHeight: 20 },
  ctaBtn: {},
  section: { gap: Spacing.sm },
  sectionLabel: { marginBottom: Spacing.xs },
  feedItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.xs },
  feedDot: { width: 8, height: 8, borderRadius: 4 },
  feedDotAlive: { backgroundColor: Colors.alive },
  feedDotElim: { backgroundColor: Colors.error },
  feedInfo: { flex: 1 },
  feedUsername: { fontSize: 14, fontWeight: '600', color: Colors.text },
});
