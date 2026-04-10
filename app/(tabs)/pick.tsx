import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { CompetitionPillRow } from '../../components/ui/CompetitionPill';
import { GameweekHeader } from '../../components/ui/GameweekHeader';
import { SurvivorCount } from '../../components/ui/SurvivorCount';
import { FixtureCard } from '../../components/picks/FixtureCard';
import { LockInSheet } from '../../components/picks/LockInSheet';
import { SignupWall } from '../../components/auth/SignupWall';
import { TeamGrid } from '../../components/picks/TeamGrid';
import { SkeletonFixture } from '../../components/ui/Skeleton';
import { Card } from '../../components/ui/Card';
import { SkullGlyph } from '../../components/ui/SkullGlyph';
import { Colors, Spacing, Typography, Fonts } from '../../constants/theme';
import { useCompetition } from '../../hooks/useCompetition';
import { useGuestPicks } from '../../hooks/useGuest';
import { useAuth } from '../../hooks/useAuth';
import {
  getCurrentMatchday,
  getMatchdayFixtures,
  getRecentResults,
  getRoundDeadline,
  getRoundName,
  isMatchLocked,
} from '../../lib/api';
import { mockMatchdayDistribution } from '../../lib/stats';
import { hypotheticalEliminations } from '../../lib/stats';
import { getGlobalStats } from '../../lib/leagueQueries';
import { ApiMatch, ApiTeam, GuestPick } from '../../types';
import { getCompetition } from '../../constants/competitions';

export default function PickScreen() {
  const { competition, setCompetition } = useCompetition();
  const { user } = useAuth();
  const { picks, usedTeamTlas, savePick, getPickForRound } = useGuestPicks(competition.id);

  const [matchday, setMatchday] = useState<number | null>(null);
  const [matches, setMatches] = useState<ApiMatch[]>([]);
  const [allTeams, setAllTeams] = useState<ApiTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<ApiTeam | null>(null);
  const [lockLoading, setLockLoading] = useState(false);
  const [showSignupWall, setShowSignupWall] = useState(false);
  const [pendingGuestPick, setPendingGuestPick] = useState<GuestPick | null>(null);
  const [recentResults, setRecentResults] = useState<ApiMatch[]>([]);
  const [globalStats, setGlobalStats] = useState<{ survivors: number; eliminated: number } | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [md, stats] = await Promise.all([
        getCurrentMatchday(competition.apiId),
        getGlobalStats(competition.id),
      ]);
      setGlobalStats(stats);

      if (md === null) {
        // No current matchday — load recent results for narrative empty state
        const recent = await getRecentResults(competition.apiId);
        setRecentResults(recent);
        setLoading(false);
        return;
      }
      setMatchday(md);
      const fixtures = await getMatchdayFixtures(competition.apiId, md);
      setMatches(fixtures);

      // Collect unique teams from fixtures for the grid
      const teamMap = new Map<string, ApiTeam>();
      fixtures.forEach((m) => {
        teamMap.set(m.homeTeam.tla, m.homeTeam);
        teamMap.set(m.awayTeam.tla, m.awayTeam);
      });
      setAllTeams(Array.from(teamMap.values()));
    } catch {
      setError('Could not load fixtures. Pull to retry.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [competition.apiId, competition.id]);

  useEffect(() => {
    setLoading(true);
    setMatches([]);
    setMatchday(null);
    setSelectedTeam(null);
    setRecentResults([]);
    load();
  }, [competition.id]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load();
  }, [load]);

  const currentPick: GuestPick | undefined = matchday
    ? getPickForRound(String(matchday))
    : undefined;

  const deadline = getRoundDeadline(matches);
  const isDeadlinePassed = deadline ? deadline <= new Date() : false;
  const roundName = matchday ? getRoundName(matches[0]?.stage ?? 'REGULAR_SEASON', matchday) : '';

  // Pick distribution from mock stats
  const pickDistribution = matches.length > 0
    ? mockMatchdayDistribution(matches, globalStats?.survivors ?? 1000)
    : new Map<string, number>();

  // Teams available after a phase reset
  const resetTeamTlas: string[] = [];

  const handleSelectTeam = useCallback(
    (tla: string) => {
      if (currentPick) return;
      const team = matches.flatMap((m) => [m.homeTeam, m.awayTeam]).find((t) => t.tla === tla);
      if (team) {
        setSelectedTeam((prev) => (prev?.tla === tla ? null : team));
      }
    },
    [matches, currentPick]
  );

  const handleLockIn = useCallback(async () => {
    if (!selectedTeam || !matchday) return;

    setLockLoading(true);
    try {
      const pick: GuestPick = {
        competitionId: competition.id,
        roundId: String(matchday),
        teamId: selectedTeam.tla,
        teamName: selectedTeam.shortName,
        teamCrest: selectedTeam.crest,
        result: 'PENDING',
        savedAt: new Date().toISOString(),
      };

      // Always save the pick locally first
      await savePick(pick);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      if (!user) {
        // Guest: save pick succeeded, now chain into SignupWall
        setPendingGuestPick(pick);
        setSelectedTeam(null);
        setShowSignupWall(true);
      } else {
        setSelectedTeam(null);
      }
    } catch {
      // pick save failed
    } finally {
      setLockLoading(false);
    }
  }, [selectedTeam, matchday, user, competition.id, savePick]);

  const handleSignupComplete = useCallback(() => {
    setShowSignupWall(false);
    setPendingGuestPick(null);
    // Pick was already saved — user is now authed, guest migration handles the rest
  }, []);

  const handleSignupDismiss = useCallback(() => {
    setShowSignupWall(false);
    setPendingGuestPick(null);
    // Pick is still saved locally — they can sign up later
  }, []);

  // Hypothetical eliminations from recent results (for empty state)
  const comp = getCompetition(competition.id);
  const hypotheticals = recentResults.length > 0
    ? hypotheticalEliminations(recentResults, comp.groupStageWinOnly)
    : [];

  const ListHeader = (
    <View style={styles.listHeader}>
      {/* Gameweek header with countdown */}
      {roundName ? (
        <GameweekHeader roundName={roundName} deadline={deadline} />
      ) : null}

      {isDeadlinePassed && (
        <Card style={styles.lockedCard}>
          <Text style={styles.lockedText}>Picks are locked for {roundName}</Text>
        </Card>
      )}

      {currentPick && (
        <Card style={styles.pickedCard}>
          <Text style={styles.pickedLabel}>Your pick this round</Text>
          <Text style={styles.pickedTeam}>{currentPick.teamName}</Text>
        </Card>
      )}

      <Text style={styles.fixtureLabel}>
        {roundName ? `${roundName} Fixtures` : 'Fixtures'}
      </Text>
    </View>
  );

  const ListFooter = allTeams.length > 0 ? (
    <TeamGrid teams={allTeams} picks={picks} resetTeamTlas={resetTeamTlas} />
  ) : null;

  // Narrative empty state — no centered emoji, always has content
  const NarrativeEmpty = () => (
    <View style={styles.emptyNarrative}>
      {globalStats && (
        <Card elevated style={styles.statsCard}>
          <SurvivorCount alive={globalStats.survivors} eliminated={globalStats.eliminated} />
        </Card>
      )}

      {recentResults.length > 0 && (
        <View style={styles.recentSection}>
          <Text style={styles.recentTitle}>Last round results</Text>
          {recentResults.slice(0, 5).map((m) => {
            const homeElim = hypotheticals.some((h) => h.tla === m.homeTeam.tla);
            const awayElim = hypotheticals.some((h) => h.tla === m.awayTeam.tla);
            return (
              <View key={m.id} style={styles.resultRow}>
                <Text style={[styles.resultTeam, homeElim && styles.resultElim]}>
                  {homeElim && <SkullGlyph size={12} />} {m.homeTeam.tla}
                </Text>
                <Text style={styles.resultScore}>
                  {m.score.fullTime.home ?? '-'} – {m.score.fullTime.away ?? '-'}
                </Text>
                <Text style={[styles.resultTeam, awayElim && styles.resultElim]}>
                  {m.awayTeam.tla} {awayElim && <SkullGlyph size={12} />}
                </Text>
              </View>
            );
          })}
          {hypotheticals.length > 0 && (
            <Text style={styles.hypothetical}>
              If you'd picked {hypotheticals[0].shortName}, you'd be out.
            </Text>
          )}
        </View>
      )}

      {recentResults.length === 0 && (
        <View style={styles.waitingBlock}>
          <Text style={styles.waitingTitle}>Season hasn't started yet</Text>
          <Text style={styles.waitingSub}>
            Check back closer to the first matchday. Fixtures will appear here automatically.
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.titleBar}>
        <Text style={styles.title}>This Week</Text>
      </View>
      <CompetitionPillRow activeId={competition.id} onSelect={setCompetition} />

      {error ? (
        <View style={styles.errorWrap}>
          <Card style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
          </Card>
        </View>
      ) : loading ? (
        <View style={styles.skeletons}>
          {[1, 2, 3, 4, 5].map((i) => <SkeletonFixture key={i} />)}
        </View>
      ) : (
        <FlatList
          data={matches}
          keyExtractor={(m) => String(m.id)}
          renderItem={({ item }) => (
            <FixtureCard
              match={item}
              selectedTeamTla={selectedTeam?.tla ?? null}
              usedTeamTlas={usedTeamTlas}
              resetTeamTlas={resetTeamTlas}
              onSelectTeam={handleSelectTeam}
              disabled={isDeadlinePassed || !!currentPick}
              pickDistribution={pickDistribution}
            />
          )}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={<NarrativeEmpty />}
          ListFooterComponent={ListFooter}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
          }
        />
      )}

      <LockInSheet
        team={selectedTeam}
        onLockIn={handleLockIn}
        onDismiss={() => setSelectedTeam(null)}
        loading={lockLoading}
        isGuest={!user}
      />

      <SignupWall
        pendingTeam={showSignupWall ? (pendingGuestPick ? {
          id: 0,
          name: pendingGuestPick.teamName,
          shortName: pendingGuestPick.teamName,
          tla: pendingGuestPick.teamId,
          crest: pendingGuestPick.teamCrest,
        } : null) : null}
        roundName={roundName}
        onAuthenticated={handleSignupComplete}
        onDismiss={handleSignupDismiss}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  titleBar: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md },
  title: {
    fontSize: Typography['2xl'],
    fontWeight: '800',
    fontFamily: Fonts.display,
    color: Colors.text,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  list: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing['4xl'] },
  listHeader: { paddingTop: Spacing.sm, gap: Spacing.sm, marginBottom: Spacing.sm },
  lockedCard: { borderColor: Colors.warning + '40' },
  lockedText: { fontSize: Typography.base, color: Colors.warning, fontWeight: '600' },
  pickedCard: { borderColor: Colors.primary + '40', backgroundColor: Colors.primary + '08' },
  pickedLabel: { fontSize: Typography.xs, color: Colors.primary, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase' },
  pickedTeam: { fontSize: Typography.lg, fontWeight: '700', color: Colors.text, marginTop: 4 },
  fixtureLabel: {
    fontSize: Typography.xs,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginTop: Spacing.sm,
  },
  skeletons: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg, gap: 8 },
  errorWrap: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg },
  errorCard: { borderColor: Colors.danger + '40' },
  errorText: { color: Colors.danger },
  // Narrative empty state
  emptyNarrative: { gap: Spacing.lg, paddingVertical: Spacing.lg },
  statsCard: { gap: Spacing.sm },
  recentSection: { gap: Spacing.sm },
  recentTitle: {
    fontSize: Typography.xs,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  resultTeam: {
    fontSize: Typography.sm,
    fontWeight: '700',
    color: Colors.text,
    width: 60,
  },
  resultElim: { color: Colors.danger },
  resultScore: {
    fontSize: Typography.sm,
    fontWeight: '800',
    color: Colors.textSecondary,
    fontVariant: ['tabular-nums'],
    textAlign: 'center',
  },
  hypothetical: {
    fontSize: Typography.sm,
    fontWeight: '600',
    color: Colors.danger,
    fontStyle: 'italic',
    marginTop: Spacing.xs,
  },
  waitingBlock: { alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.xl },
  waitingTitle: {
    fontSize: Typography.md,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  waitingSub: {
    fontSize: Typography.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
