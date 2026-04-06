/**
 * Profile Tab — user stats, season history, teams used grid
 */
import React from 'react';
import { View, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { Text } from '../../components/ui/Text';
import { Card } from '../../components/ui/Card';
import { TeamCrest } from '../../components/ui/TeamCrest';
import { Colors, Spacing, Radius } from '../../constants/theme';
import { PL_TEAMS, getTeamById } from '../../constants/teams';
import { useAuth } from '../../hooks/useAuth';
import { signOut } from '../../lib/firebase';
import type { SeasonHistory } from '../../types';

// Mock data
const MOCK_LONGEST_STREAK = 12;
const MOCK_TEAMS_USED = ['LIV', 'MCI', 'ARS', 'NEW', 'TOT', 'BHA', 'CHE', 'AVL'];

const MOCK_HISTORY: SeasonHistory[] = [
  {
    leagueId: 'global_24',
    leagueName: 'Global Pool 2024/25',
    eliminatedWeek: undefined, // still alive
    totalPlayers: 14820,
    position: undefined,
  },
  {
    leagueId: 'l1_24',
    leagueName: 'The Office Banter Pool',
    eliminatedWeek: undefined,
    totalPlayers: 12,
  },
  {
    leagueId: 'global_23',
    leagueName: 'Global Pool 2023/24',
    eliminatedWeek: 22,
    eliminatedByTeamId: 'EVE',
    totalPlayers: 11240,
    position: 847,
  },
];

export default function ProfileScreen() {
  const { user } = useAuth();
  const displayName = user?.displayName ?? user?.email?.split('@')[0] ?? 'Player';
  const initials = displayName.slice(0, 2).toUpperCase();

  const handleSignOut = async () => {
    Alert.alert('Sign out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: () => signOut(),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text variant="heading">Profile</Text>
          <TouchableOpacity onPress={handleSignOut}>
            <Text variant="caption" color={Colors.textMuted}>Sign out</Text>
          </TouchableOpacity>
        </View>

        {/* Avatar + Name */}
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.initials}>{initials}</Text>
          </View>
          <View>
            <Text variant="subheading">{displayName}</Text>
            <Text variant="caption" color={Colors.textSecondary}>{user?.email}</Text>
          </View>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <StatCard label="Longest Streak" value={`${MOCK_LONGEST_STREAK}`} suffix="wks" accent />
          <StatCard label="Teams Used" value={`${MOCK_TEAMS_USED.length}`} suffix="/20" />
          <StatCard label="Seasons" value={`${MOCK_HISTORY.length}`} suffix="" />
        </View>

        {/* Season history */}
        <View style={styles.section}>
          <Text variant="label" color={Colors.textSecondary} style={styles.sectionLabel}>
            Season History
          </Text>
          {MOCK_HISTORY.map((h) => (
            <HistoryCard key={h.leagueId} history={h} />
          ))}
        </View>

        {/* Teams used grid */}
        <View style={styles.section}>
          <Text variant="label" color={Colors.textSecondary} style={styles.sectionLabel}>
            Teams Used This Season
          </Text>
          <View style={styles.teamsGrid}>
            {PL_TEAMS.map((team) => {
              const used = MOCK_TEAMS_USED.includes(team.id);
              return (
                <View key={team.id} style={styles.teamCell}>
                  <TeamCrest uri={team.crest} size={44} dimmed={!used} />
                  <Text style={[styles.teamLabel, !used && styles.teamLabelUnused]}>
                    {team.shortName}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({
  label,
  value,
  suffix,
  accent,
}: {
  label: string;
  value: string;
  suffix: string;
  accent?: boolean;
}) {
  return (
    <Card elevated style={styles.statCard}>
      <View style={styles.statValueRow}>
        <Text style={[styles.statValue, accent && styles.statValueAccent]}>{value}</Text>
        <Text style={styles.statSuffix} color={Colors.textMuted}>{suffix}</Text>
      </View>
      <Text variant="caption" color={Colors.textSecondary}>{label}</Text>
    </Card>
  );
}

function HistoryCard({ history }: { history: SeasonHistory }) {
  const alive = !history.eliminatedWeek;
  const elimTeam = history.eliminatedByTeamId ? getTeamById(history.eliminatedByTeamId) : null;

  return (
    <Card style={styles.historyCard}>
      <View style={styles.historyHeader}>
        <Text weight="semibold">{history.leagueName}</Text>
        <View style={[styles.statusPill, alive ? styles.alivePill : styles.elimPill]}>
          <Text style={[styles.statusText, alive ? styles.aliveText : styles.elimText]}>
            {alive ? 'Alive' : `Out GW${history.eliminatedWeek}`}
          </Text>
        </View>
      </View>

      {!alive && elimTeam && (
        <View style={styles.elimRow}>
          <Text variant="caption" color={Colors.textMuted}>Eliminated by </Text>
          <TeamCrest uri={elimTeam.crest} size={18} />
          <Text variant="caption" color={Colors.textSecondary}>{elimTeam.name}</Text>
        </View>
      )}

      {history.position && (
        <Text variant="caption" color={Colors.textMuted}>
          Finished #{history.position} of {history.totalPlayers.toLocaleString()}
        </Text>
      )}

      {alive && (
        <Text variant="caption" color={Colors.alive}>
          Still in the running — {history.totalPlayers.toLocaleString()} started
        </Text>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing['4xl'], gap: Spacing.lg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: Spacing.base },
  profileSection: { flexDirection: 'row', alignItems: 'center', gap: Spacing.base },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: { fontSize: 22, fontWeight: '800', color: Colors.text },
  statsRow: { flexDirection: 'row', gap: Spacing.sm },
  statCard: { flex: 1, alignItems: 'center', gap: 2, paddingVertical: Spacing.md },
  statValueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 2 },
  statValue: { fontSize: 26, fontWeight: '800', color: Colors.text },
  statValueAccent: { color: Colors.accent },
  statSuffix: { fontSize: 13 },
  section: { gap: Spacing.sm },
  sectionLabel: {},
  historyCard: {},
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xs },
  statusPill: { borderRadius: Radius.full, paddingHorizontal: Spacing.sm, paddingVertical: 3 },
  alivePill: { backgroundColor: Colors.alive + '20' },
  elimPill: { backgroundColor: Colors.error + '20' },
  statusText: { fontSize: 11, fontWeight: '700' },
  aliveText: { color: Colors.alive },
  elimText: { color: Colors.error },
  elimRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  teamsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  teamCell: { alignItems: 'center', gap: 4, width: 52 },
  teamLabel: { fontSize: 10, fontWeight: '600', color: Colors.text, textAlign: 'center' },
  teamLabelUnused: { color: Colors.textMuted },
});
