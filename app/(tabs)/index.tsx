import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { CompetitionPillRow } from '../../components/ui/CompetitionPill';
import { RoundCard } from '../../components/home/RoundCard';
import { FixtureRow } from '../../components/home/FixtureRow';
import { ActivityFeedItem } from '../../components/home/ActivityFeedItem';
import { CountdownTimer } from '../../components/ui/CountdownTimer';
import { SkeletonCard, SkeletonFixture } from '../../components/ui/Skeleton';
import { Card } from '../../components/ui/Card';
import { Colors, Spacing, Typography } from '../../constants/theme';
import { useCompetition } from '../../hooks/useCompetition';
import { useGuestPicks } from '../../hooks/useGuest';
import { useAuth } from '../../hooks/useAuth';
import {
  getCurrentMatchday,
  getMatchdayFixtures,
  getRoundDeadline,
  getRoundName,
} from '../../lib/api';
import { ApiMatch, GuestPick } from '../../types';

export default function HomeScreen() {
  const { competition, setCompetition } = useCompetition();
  const { user } = useAuth();
  const { picks, getPickForRound } = useGuestPicks(competition.id);

  const [matchday, setMatchday] = useState<number | null>(null);
  const [matches, setMatches] = useState<ApiMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const md = await getCurrentMatchday(competition.apiId);
      if (md === null) {
        setLoading(false);
        return;
      }
      setMatchday(md);
      const fixtures = await getMatchdayFixtures(competition.apiId, md);
      setMatches(fixtures);
    } catch (e) {
      setError('Could not load fixtures. Check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [competition.apiId]);

  useEffect(() => {
    setLoading(true);
    setMatches([]);
    setMatchday(null);
    load();
  }, [competition.id]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load();
  }, [load]);

  const deadline = getRoundDeadline(matches);
  const roundName = matchday
    ? getRoundName(matches[0]?.stage ?? 'REGULAR_SEASON', matchday)
    : null;
  const currentPick: GuestPick | undefined = matchday
    ? getPickForRound(String(matchday))
    : undefined;

  const displayName = user?.displayName ?? user?.email?.split('@')[0] ?? 'You';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              {user ? `Welcome back, ${displayName}` : 'Playing as guest'}
            </Text>
            <Text style={styles.appName}>Last Man Standing</Text>
          </View>
          {deadline && !loading && (
            <View style={styles.headerTimer}>
              <Text style={styles.headerTimerLabel}>Deadline</Text>
              <CountdownTimer deadline={deadline} size="sm" />
            </View>
          )}
        </View>

        {/* Competition selector */}
        <CompetitionPillRow activeId={competition.id} onSelect={setCompetition} />

        <View style={styles.body}>
          {error ? (
            <Card style={styles.errorCard}>
              <Text style={styles.errorText}>{error}</Text>
            </Card>
          ) : loading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              {[1, 2, 3].map((i) => <SkeletonFixture key={i} />)}
            </>
          ) : (
            <>
              {/* Current round card */}
              {roundName && (
                <RoundCard
                  roundName={roundName}
                  deadline={deadline}
                  currentPick={currentPick ?? null}
                  onPickPress={() => router.push('/(tabs)/pick')}
                />
              )}

              {/* Live/Recent fixtures */}
              {matches.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>
                    {matches.some((m) => m.status === 'IN_PLAY') ? 'Live Now' : 'Fixtures'}
                  </Text>
                  <FixtureRow matches={matches} />
                </View>
              )}

              {/* League activity feed */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>League Activity</Text>
                {user ? (
                  <Text style={styles.emptyFeed}>
                    Connect to a league to see your friends' picks here.
                  </Text>
                ) : (
                  <Text style={styles.emptyFeed}>
                    Sign up and join a league to see activity here.
                  </Text>
                )}
              </View>

              {/* Season picks summary */}
              {picks.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Your Picks ({competition.shortName})</Text>
                  {[...picks].reverse().map((p, i) => (
                    <ActivityFeedItem
                      key={i}
                      username={user?.displayName ?? 'You'}
                      teamName={p.teamName}
                      teamTla={p.teamId}
                      result={p.result}
                      roundName={`Round ${p.roundId}`}
                    />
                  ))}
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingBottom: Spacing['4xl'] },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.lg,
  },
  greeting: { fontSize: Typography.sm, color: Colors.textSecondary },
  appName: { fontSize: Typography.xl, fontWeight: Typography.extrabold, color: Colors.text, letterSpacing: -0.5 },
  headerTimer: { alignItems: 'flex-end', gap: 2 },
  headerTimerLabel: { fontSize: 10, color: Colors.textMuted, fontWeight: '600', letterSpacing: 0.5 },
  body: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg, gap: Spacing.base },
  section: { gap: Spacing.sm },
  sectionTitle: {
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
    color: Colors.textSecondary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: Spacing.xs,
  },
  errorCard: { borderColor: Colors.danger + '40' },
  errorText: { color: Colors.danger, fontSize: Typography.base },
  emptyFeed: { fontSize: Typography.base, color: Colors.textMuted, lineHeight: 22 },
});
