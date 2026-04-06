import { SafeAreaView } from 'react-native-safe-area-context';
/**
 * Onboarding Screen 2: Pick your first team from this week's fixtures
 */
import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet,  TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Text } from '../../components/ui/Text';
import { FixtureCard } from '../../components/picks/FixtureCard';
import { LockInSheet } from '../../components/picks/LockInSheet';
import { Colors, Spacing } from '../../constants/theme';
import type { Fixture } from '../../types';

// Mock fixtures for onboarding (replaced by real API data post-auth)
const MOCK_FIXTURES: Fixture[] = [
  {
    id: 'f1', homeTeamId: 'LIV', awayTeamId: 'ARS', kickoff: new Date(Date.now() + 2 * 86400000).toISOString(),
    gameweek: 31, status: 'scheduled',
    homeForm: ['W', 'W', 'D'], awayForm: ['W', 'L', 'W'],
  },
  {
    id: 'f2', homeTeamId: 'MCI', awayTeamId: 'CHE', kickoff: new Date(Date.now() + 2 * 86400000 + 3600000).toISOString(),
    gameweek: 31, status: 'scheduled',
    homeForm: ['D', 'W', 'W'], awayForm: ['L', 'W', 'D'],
  },
  {
    id: 'f3', homeTeamId: 'MNU', awayTeamId: 'TOT', kickoff: new Date(Date.now() + 2 * 86400000 + 7200000).toISOString(),
    gameweek: 31, status: 'scheduled',
    homeForm: ['L', 'D', 'W'], awayForm: ['W', 'W', 'L'],
  },
  {
    id: 'f4', homeTeamId: 'NEW', awayTeamId: 'AVL', kickoff: new Date(Date.now() + 3 * 86400000).toISOString(),
    gameweek: 31, status: 'scheduled',
    homeForm: ['W', 'W', 'W'], awayForm: ['D', 'W', 'L'],
  },
  {
    id: 'f5', homeTeamId: 'BHA', awayTeamId: 'FUL', kickoff: new Date(Date.now() + 3 * 86400000 + 3600000).toISOString(),
    gameweek: 31, status: 'scheduled',
    homeForm: ['W', 'D', 'W'], awayForm: ['L', 'L', 'W'],
  },
  {
    id: 'f6', homeTeamId: 'EVE', awayTeamId: 'BOU', kickoff: new Date(Date.now() + 3 * 86400000 + 7200000).toISOString(),
    gameweek: 31, status: 'scheduled',
    homeForm: ['D', 'L', 'D'], awayForm: ['W', 'W', 'D'],
  },
  {
    id: 'f7', homeTeamId: 'WHU', awayTeamId: 'WOL', kickoff: new Date(Date.now() + 3 * 86400000 + 10800000).toISOString(),
    gameweek: 31, status: 'scheduled',
    homeForm: ['L', 'W', 'L'], awayForm: ['D', 'L', 'W'],
  },
  {
    id: 'f8', homeTeamId: 'NFO', awayTeamId: 'LEI', kickoff: new Date(Date.now() + 4 * 86400000).toISOString(),
    gameweek: 31, status: 'scheduled',
    homeForm: ['W', 'D', 'W'], awayForm: ['L', 'L', 'L'],
  },
  {
    id: 'f9', homeTeamId: 'CRY', awayTeamId: 'BRE', kickoff: new Date(Date.now() + 4 * 86400000 + 3600000).toISOString(),
    gameweek: 31, status: 'scheduled',
    homeForm: ['L', 'W', 'D'], awayForm: ['W', 'D', 'W'],
  },
  {
    id: 'f10', homeTeamId: 'IPS', awayTeamId: 'SOU', kickoff: new Date(Date.now() + 4 * 86400000 + 7200000).toISOString(),
    gameweek: 31, status: 'scheduled',
    homeForm: ['D', 'L', 'L'], awayForm: ['L', 'D', 'L'],
  },
];

export default function OnboardingFixtures() {
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [pendingLockIn, setPendingLockIn] = useState(false);

  const handleSelectTeam = useCallback((teamId: string) => {
    setSelectedTeam(teamId);
  }, []);

  const handleLockIn = useCallback(() => {
    setPendingLockIn(true);
    // Store pick in session, navigate to signup
    setTimeout(() => {
      setPendingLockIn(false);
      router.push({
        pathname: '/(onboarding)/signup',
        params: { teamId: selectedTeam, gameweek: 31 },
      });
    }, 600);
  }, [selectedTeam]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text color={Colors.textSecondary}>← Back</Text>
        </TouchableOpacity>
        <Text variant="label" color={Colors.textSecondary}>Gameweek 31</Text>
      </View>

      <View style={styles.titleArea}>
        <Text style={styles.title}>Who's winning{'\n'}this weekend?</Text>
        <Text variant="body" color={Colors.textSecondary}>
          Tap a team to pick them. Tap again to deselect.
        </Text>
      </View>

      <FlatList
        data={MOCK_FIXTURES}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <FixtureCard
            fixture={item}
            selectedTeamId={selectedTeam}
            usedTeamIds={[]}
            onSelectTeam={(tid) =>
              selectedTeam === tid ? setSelectedTeam(null) : handleSelectTeam(tid)
            }
          />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

      <LockInSheet
        teamId={selectedTeam}
        onLockIn={handleLockIn}
        onDismiss={() => setSelectedTeam(null)}
        loading={pendingLockIn}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  back: { padding: Spacing.sm },
  titleArea: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.base, gap: Spacing.sm },
  title: { fontSize: 32, fontWeight: '800', letterSpacing: -1, lineHeight: 36, color: Colors.text },
  list: { paddingHorizontal: Spacing.xl, paddingBottom: 200 },
});
