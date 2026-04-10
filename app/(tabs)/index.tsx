import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { CompetitionPillRow } from '../../components/ui/CompetitionPill';
import { LiveTicker } from '../../components/ui/LiveTicker';
import { SurvivorCount } from '../../components/ui/SurvivorCount';
import { TopPicksMini } from '../../components/home/TopPicksMini';
import { RoundCard } from '../../components/home/RoundCard';
import { FixtureRow } from '../../components/home/FixtureRow';
import { LeagueCard } from '../../components/leagues/LeagueCard';
import { ActivityFeedItem } from '../../components/home/ActivityFeedItem';
import { SkeletonCard, SkeletonFixture } from '../../components/ui/Skeleton';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Colors, Spacing, Typography, Fonts } from '../../constants/theme';
import { useCompetition } from '../../hooks/useCompetition';
import { useGuestPicks } from '../../hooks/useGuest';
import { useAuth } from '../../hooks/useAuth';
import {
  getCurrentMatchday,
  getMatchdayFixtures,
  getRoundDeadline,
  getRoundName,
} from '../../lib/api';
import { getTickerItems } from '../../lib/ticker';
import { getGlobalStats, getUserLeagues, getUserStatus } from '../../lib/leagueQueries';
import { mockMatchdayDistribution, topPicks } from '../../lib/stats';
import { ApiMatch, GuestPick, League, MemberStatus } from '../../types';

export default function HomeScreen() {
  const { competition, setCompetition } = useCompetition();
  const { user } = useAuth();
  const { picks, getPickForRound } = useGuestPicks(competition.id);

  const [matchday, setMatchday] = useState<number | null>(null);
  const [matches, setMatches] = useState<ApiMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tickerItems, setTickerItems] = useState<string[]>([]);
  const [globalStats, setGlobalStats] = useState<{ survivors: number; eliminated: number; totalPlayers: number; currentGameweek: number } | null>(null);
  const [topPicksData, setTopPicksData] = useState<Array<{ tla: string; crest: string; shortName: string; percentage: number }>>([]);
  const [userLeagues, setUserLeagues] = useState<League[]>([]);
  const [leagueStatuses, setLeagueStatuses] = useState<Record<string, MemberStatus | 'GUEST' | null>>({});

  const load = useCallback(async () => {
    setError(null);
    try {
      const [md, stats] = await Promise.all([
        getCurrentMatchday(competition.apiId),
        getGlobalStats(competition.id),
      ]);
      setGlobalStats(stats);

      let fixturesList: ApiMatch[] = [];
      if (md !== null) {
        setMatchday(md);
        fixturesList = await getMatchdayFixtures(competition.apiId, md);
        setMatches(fixturesList);
      }

      // Ticker items (at least one from real data)
      const ticker = await getTickerItems(competition.id, fixturesList);
      setTickerItems(ticker);

      // Top picks from mock distribution
      if (fixturesList.length > 0 && stats) {
        const dist = mockMatchdayDistribution(fixturesList, stats.survivors);
        const top = topPicks(dist, 3);
        // Enrich with crest and shortName from fixtures
        const allTeams = fixturesList.flatMap((m) => [m.homeTeam, m.awayTeam]);
        setTopPicksData(
          top.map((t) => {
            const team = allTeams.find((at) => at.tla === t.tla);
            return {
              tla: t.tla,
              crest: team?.crest ?? '',
              shortName: team?.shortName ?? t.tla,
              percentage: t.percentage,
            };
          })
        );
      }

      // Signed-in: load user leagues
      if (user) {
        const leagues = await getUserLeagues(user.uid, null);
        const competitionLeagues = leagues.filter((l) => l.competitionId === competition.id);
        setUserLeagues(competitionLeagues);

        // Load statuses
        const statuses: Record<string, MemberStatus | 'GUEST' | null> = {};
        for (const l of competitionLeagues) {
          statuses[l.id] = await getUserStatus(l.id, user.uid, null);
        }
        setLeagueStatuses(statuses);
      }
    } catch {
      setError('Could not load data. Check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [competition.apiId, competition.id, user]);

  useEffect(() => {
    setLoading(true);
    setMatches([]);
    setMatchday(null);
    setTickerItems([]);
    setTopPicksData([]);
    setUserLeagues([]);
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {/* Wordmark */}
        <View style={styles.header}>
          <Text style={styles.wordmark}>LAST MAN STANDING</Text>
        </View>

        {/* Live ticker */}
        {tickerItems.length > 0 && <LiveTicker items={tickerItems} />}

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

              {/* Live/Recent fixtures row */}
              {matches.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>
                    {matches.some((m) => m.status === 'IN_PLAY') ? 'Live Now' : 'Fixtures'}
                  </Text>
                  <FixtureRow matches={matches} />
                </View>
              )}

              {/* ── Signed-in: user leagues ── */}
              {user && userLeagues.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Your Leagues</Text>
                  {userLeagues.map((league) => (
                    <LeagueCard
                      key={league.id}
                      league={league}
                      userStatus={leagueStatuses[league.id] ?? null}
                      onPress={() => router.push('/(tabs)/leagues')}
                    />
                  ))}
                </View>
              )}

              {/* ── Global pool card (guests, or signed-in with no leagues) ── */}
              {(!user || userLeagues.length === 0) && globalStats && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>This week in the Global Pool</Text>
                  <Card elevated style={styles.poolCard}>
                    <SurvivorCount
                      alive={globalStats.survivors}
                      eliminated={globalStats.eliminated}
                    />
                    {roundName && (
                      <Text style={styles.poolGameweek}>
                        {roundName} · {matches.length} fixtures
                      </Text>
                    )}
                  </Card>

                  {/* Top picks mini-leaderboard */}
                  {topPicksData.length > 0 && <TopPicksMini picks={topPicksData} />}

                  {/* CTA */}
                  <TouchableOpacity
                    style={styles.ctaButton}
                    onPress={() => router.push('/(tabs)/pick')}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.ctaText}>
                      {user ? 'Join the Global Pool \u2192' : 'Make your pick \u2192'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Season picks summary (supplementary, below the fold) */}
              {picks.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>
                    Your Picks ({competition.shortName})
                  </Text>
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
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  wordmark: {
    fontSize: Typography['3xl'],
    fontFamily: Fonts.display,
    fontWeight: '400', // Bebas Neue is single-weight; explicit 400 avoids RN bold synthesis
    color: Colors.text,
    letterSpacing: 2,
  },
  body: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.md, gap: Spacing.base },
  section: { gap: Spacing.sm },
  sectionTitle: {
    fontSize: Typography.sm,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: Spacing.xs,
  },
  poolCard: { gap: Spacing.sm },
  poolGameweek: {
    fontSize: Typography.sm,
    color: Colors.textMuted,
    fontWeight: '600',
    marginTop: 2,
  },
  ctaButton: {
    backgroundColor: Colors.primary + '14',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary + '40',
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  ctaText: {
    fontSize: Typography.md,
    fontWeight: '700',
    color: Colors.primary,
  },
  errorCard: { borderColor: Colors.danger + '40' },
  errorText: { color: Colors.danger, fontSize: Typography.base },
});
