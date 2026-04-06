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
import { CountdownTimer } from '../../components/ui/CountdownTimer';
import { FixtureCard } from '../../components/picks/FixtureCard';
import { LockInSheet } from '../../components/picks/LockInSheet';
import { TeamGrid } from '../../components/picks/TeamGrid';
import { SkeletonFixture } from '../../components/ui/Skeleton';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Colors, Spacing, Typography } from '../../constants/theme';
import { useCompetition } from '../../hooks/useCompetition';
import { useGuestPicks } from '../../hooks/useGuest';
import { useAuth } from '../../hooks/useAuth';
import { useAuthModal } from '../../contexts/AuthModal';
import {
  getCurrentMatchday,
  getMatchdayFixtures,
  getRoundDeadline,
  getRoundName,
  isMatchLocked,
} from '../../lib/api';
import { ApiMatch, ApiTeam, GuestPick } from '../../types';
import { getCompetition } from '../../constants/competitions';

export default function PickScreen() {
  const { competition, setCompetition } = useCompetition();
  const { user } = useAuth();
  const { show: showAuth } = useAuthModal();
  const { picks, usedTeamTlas, savePick, getPickForRound } = useGuestPicks(competition.id);

  const [matchday, setMatchday] = useState<number | null>(null);
  const [matches, setMatches] = useState<ApiMatch[]>([]);
  const [allTeams, setAllTeams] = useState<ApiTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<ApiTeam | null>(null);
  const [lockLoading, setLockLoading] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const md = await getCurrentMatchday(competition.apiId);
      if (md === null) { setLoading(false); return; }
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
  }, [competition.apiId]);

  useEffect(() => {
    setLoading(true);
    setMatches([]);
    setMatchday(null);
    setSelectedTeam(null);
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

  // Teams available after a phase reset (simplified: none for now, extend with phase logic)
  const resetTeamTlas: string[] = [];

  const handleSelectTeam = useCallback(
    (tla: string) => {
      if (currentPick) return; // already picked
      const team = matches.flatMap((m) => [m.homeTeam, m.awayTeam]).find((t) => t.tla === tla);
      if (team) {
        setSelectedTeam((prev) => (prev?.tla === tla ? null : team));
      }
    },
    [matches, currentPick]
  );

  const handleLockIn = useCallback(async () => {
    if (!selectedTeam || !matchday) return;

    // Require auth for lock-in
    if (!user) {
      showAuth('Sign up to save your pick and join leagues');
      return;
    }

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
      await savePick(pick);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSelectedTeam(null);
    } catch {
      // pick save failed
    } finally {
      setLockLoading(false);
    }
  }, [selectedTeam, matchday, user, competition.id, savePick, showAuth]);

  const ListHeader = (
    <View style={styles.listHeader}>
      {deadline && !isDeadlinePassed && (
        <Card elevated style={styles.deadlineCard}>
          <Text style={styles.deadlineLabel}>{roundName} deadline</Text>
          <CountdownTimer deadline={deadline} size="lg" />
        </Card>
      )}
      {isDeadlinePassed && (
        <Card style={styles.lockedCard}>
          <Text style={styles.lockedText}>🔒 Picks are locked for {roundName}</Text>
        </Card>
      )}
      {currentPick && (
        <Card style={styles.pickedCard}>
          <Text style={styles.pickedLabel}>Your pick this round</Text>
          <Text style={styles.pickedTeam}>{currentPick.teamName}</Text>
        </Card>
      )}
      <Text style={styles.fixtureLabel}>
        {roundName} Fixtures
      </Text>
    </View>
  );

  const ListFooter = allTeams.length > 0 ? (
    <TeamGrid teams={allTeams} picks={picks} resetTeamTlas={resetTeamTlas} />
  ) : null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.titleBar}>
        <Text style={styles.title}>Pick</Text>
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
            />
          )}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={
            <EmptyState
              icon="📅"
              title="Upcoming fixtures will appear here."
              subtitle="Check back closer to the next matchday."
              ctaLabel={user ? undefined : 'Sign up to make your picks'}
              onCta={user ? undefined : () => showAuth('Sign up to make your picks')}
            />
          }
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
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  titleBar: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md },
  title: { fontSize: Typography.xl, fontWeight: Typography.extrabold, color: Colors.text, letterSpacing: -0.5 },
  list: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing['4xl'] },
  listHeader: { paddingTop: Spacing.lg, gap: Spacing.sm, marginBottom: Spacing.sm },
  deadlineCard: { gap: Spacing.sm },
  deadlineLabel: { fontSize: Typography.sm, color: Colors.textSecondary, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  lockedCard: { borderColor: Colors.warning + '40' },
  lockedText: { fontSize: Typography.base, color: Colors.warning, fontWeight: '600' },
  pickedCard: { borderColor: Colors.primary + '40', backgroundColor: Colors.primary + '08' },
  pickedLabel: { fontSize: Typography.xs, color: Colors.primary, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase' },
  pickedTeam: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.text, marginTop: 4 },
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
});
