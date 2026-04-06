/**
 * Pick Tab — fixtures for current gameweek + season picks grid
 */
import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, SafeAreaView, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Text } from '../../components/ui/Text';
import { FixtureCard } from '../../components/picks/FixtureCard';
import { LockInSheet } from '../../components/picks/LockInSheet';
import { SeasonGrid } from '../../components/picks/SeasonGrid';
import { CountdownCard } from '../../components/home/CountdownCard';
import { Colors, Spacing } from '../../constants/theme';
import type { Fixture, Pick } from '../../types';

// Mock data — replace with Supabase queries
const MOCK_FIXTURES: Fixture[] = [
  {
    id: 'f1', homeTeamId: 'LIV', awayTeamId: 'ARS', kickoff: new Date(Date.now() + 36 * 3600000).toISOString(),
    gameweek: 31, status: 'scheduled',
    homeForm: ['W', 'W', 'D'], awayForm: ['W', 'L', 'W'],
  },
  {
    id: 'f2', homeTeamId: 'MCI', awayTeamId: 'CHE', kickoff: new Date(Date.now() + 37 * 3600000).toISOString(),
    gameweek: 31, status: 'scheduled',
    homeForm: ['D', 'W', 'W'], awayForm: ['L', 'W', 'D'],
  },
  {
    id: 'f3', homeTeamId: 'MNU', awayTeamId: 'TOT', kickoff: new Date(Date.now() + 38 * 3600000).toISOString(),
    gameweek: 31, status: 'scheduled',
    homeForm: ['L', 'D', 'W'], awayForm: ['W', 'W', 'L'],
  },
  {
    id: 'f4', homeTeamId: 'NEW', awayTeamId: 'AVL', kickoff: new Date(Date.now() + 48 * 3600000).toISOString(),
    gameweek: 31, status: 'scheduled',
    homeForm: ['W', 'W', 'W'], awayForm: ['D', 'W', 'L'],
  },
  {
    id: 'f5', homeTeamId: 'BHA', awayTeamId: 'FUL', kickoff: new Date(Date.now() + 49 * 3600000).toISOString(),
    gameweek: 31, status: 'scheduled',
    homeForm: ['W', 'D', 'W'], awayForm: ['L', 'L', 'W'],
  },
  {
    id: 'f6', homeTeamId: 'EVE', awayTeamId: 'BOU', kickoff: new Date(Date.now() + 50 * 3600000).toISOString(),
    gameweek: 31, status: 'scheduled',
    homeForm: ['D', 'L', 'D'], awayForm: ['W', 'W', 'D'],
  },
  {
    id: 'f7', homeTeamId: 'WHU', awayTeamId: 'WOL', kickoff: new Date(Date.now() + 60 * 3600000).toISOString(),
    gameweek: 31, status: 'scheduled',
    homeForm: ['L', 'W', 'L'], awayForm: ['D', 'L', 'W'],
  },
  {
    id: 'f8', homeTeamId: 'NFO', awayTeamId: 'LEI', kickoff: new Date(Date.now() + 61 * 3600000).toISOString(),
    gameweek: 31, status: 'scheduled',
    homeForm: ['W', 'D', 'W'], awayForm: ['L', 'L', 'L'],
  },
  {
    id: 'f9', homeTeamId: 'CRY', awayTeamId: 'BRE', kickoff: new Date(Date.now() + 62 * 3600000).toISOString(),
    gameweek: 31, status: 'scheduled',
    homeForm: ['L', 'W', 'D'], awayForm: ['W', 'D', 'W'],
  },
  {
    id: 'f10', homeTeamId: 'IPS', awayTeamId: 'SOU', kickoff: new Date(Date.now() + 72 * 3600000).toISOString(),
    gameweek: 31, status: 'scheduled',
    homeForm: ['D', 'L', 'L'], awayForm: ['L', 'D', 'L'],
  },
];

const MOCK_USED_TEAMS = ['LIV', 'MCI', 'ARS', 'NEW', 'TOT', 'BHA'];

const MOCK_SEASON_PICKS: Pick[] = [
  { id: '1', userId: 'u1', leagueId: 'global', gameweek: 25, teamId: 'LIV', lockedAt: '', result: 'survived' },
  { id: '2', userId: 'u1', leagueId: 'global', gameweek: 26, teamId: 'MCI', lockedAt: '', result: 'survived' },
  { id: '3', userId: 'u1', leagueId: 'global', gameweek: 27, teamId: 'ARS', lockedAt: '', result: 'survived' },
  { id: '4', userId: 'u1', leagueId: 'global', gameweek: 28, teamId: 'NEW', lockedAt: '', result: 'survived' },
  { id: '5', userId: 'u1', leagueId: 'global', gameweek: 29, teamId: 'TOT', lockedAt: '', result: 'survived' },
  { id: '6', userId: 'u1', leagueId: 'global', gameweek: 30, teamId: 'BHA', lockedAt: '', result: 'survived' },
];

const MOCK_DEADLINE = new Date(Date.now() + 36 * 60 * 60 * 1000);
const CURRENT_GW = 31;

export default function PickScreen() {
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [lockedPick, setLockedPick] = useState<string | null>(null);
  const [lockLoading, setLockLoading] = useState(false);

  const handleSelectTeam = useCallback((teamId: string) => {
    if (lockedPick) return; // already picked this week
    setSelectedTeam((prev) => (prev === teamId ? null : teamId));
  }, [lockedPick]);

  const handleLockIn = useCallback(() => {
    if (!selectedTeam) return;
    setLockLoading(true);
    // TODO: persist to Supabase
    setTimeout(() => {
      setLockedPick(selectedTeam);
      setSelectedTeam(null);
      setLockLoading(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 700);
  }, [selectedTeam]);

  const ListHeader = (
    <View style={styles.listHeader}>
      <CountdownCard deadline={MOCK_DEADLINE} gameweek={CURRENT_GW} />
      {lockedPick && (
        <View style={styles.lockedBanner}>
          <Text style={styles.lockedIcon}>🔒</Text>
          <Text variant="body" weight="semibold">
            Locked in for GW{CURRENT_GW}
          </Text>
        </View>
      )}
      <Text variant="label" color={Colors.textSecondary} style={styles.fixturesLabel}>
        Fixtures — Gameweek {CURRENT_GW}
      </Text>
    </View>
  );

  const ListFooter = (
    <View style={styles.listFooter}>
      <SeasonGrid picks={MOCK_SEASON_PICKS} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.titleBar}>
        <Text variant="heading">Pick</Text>
      </View>

      <FlatList
        data={MOCK_FIXTURES}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <FixtureCard
            fixture={item}
            selectedTeamId={selectedTeam}
            usedTeamIds={MOCK_USED_TEAMS}
            onSelectTeam={handleSelectTeam}
            locked={!!lockedPick}
          />
        )}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

      <LockInSheet
        teamId={selectedTeam}
        onLockIn={handleLockIn}
        onDismiss={() => setSelectedTeam(null)}
        loading={lockLoading}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  titleBar: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.base },
  list: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing['4xl'] },
  listHeader: { gap: Spacing.sm, marginBottom: Spacing.sm },
  listFooter: { marginTop: Spacing.xl },
  fixturesLabel: {},
  lockedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.alive + '15',
    borderRadius: 10,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.alive + '40',
  },
  lockedIcon: { fontSize: 18 },
});
