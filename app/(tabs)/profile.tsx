import React from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { PickBadge } from '../../components/ui/PickBadge';
import { Colors, Spacing, Radius, Typography } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import { useAuthModal } from '../../contexts/AuthModal';
import { useGuestPicks } from '../../hooks/useGuest';
import { useCompetition } from '../../hooks/useCompetition';
import { signOut } from '../../lib/firebase';

export default function ProfileScreen() {
  const { user } = useAuth();
  const { show: showAuth } = useAuthModal();
  const { competition } = useCompetition();
  const { picks } = useGuestPicks(competition.id);

  const displayName = user?.displayName ?? user?.email?.split('@')[0] ?? 'Guest';
  const initials = displayName.slice(0, 2).toUpperCase();

  const totalWins = picks.filter((p) => p.result === 'WIN').length;
  const isEliminated = picks.some((p) => p.result === 'LOSS');
  const roundsSurvived = picks.filter((p) => p.result === 'WIN' || p.result === 'DRAW').length;

  const handleSignOut = () => {
    Alert.alert('Sign out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: () => signOut() },
    ]);
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.header}>
            <Text style={styles.title}>Profile</Text>
          </View>

          <Card style={styles.guestCard}>
            <View style={styles.guestAvatar}>
              <Text style={styles.guestAvatarText}>?</Text>
            </View>
            <Text style={styles.guestName}>Playing as Guest</Text>
            <Text style={styles.guestBody}>
              Sign up to save your pick history, join leagues, and track your stats across devices.
            </Text>
            <Button title="Sign Up Free" onPress={() => showAuth('Create an account to save your progress')} style={styles.signUpBtn} />
            <Button title="Sign In" onPress={() => showAuth('Sign in to your account')} variant="secondary" style={styles.signUpBtn} />
          </Card>

          {picks.length > 0 && <LocalPicksSection picks={picks} />}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <TouchableOpacity onPress={handleSignOut}>
            <Text style={styles.signOutBtn}>Sign out</Text>
          </TouchableOpacity>
        </View>

        {/* Avatar */}
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.initials}>{initials}</Text>
          </View>
          <View>
            <Text style={styles.displayName}>{displayName}</Text>
            <Text style={styles.email}>{user.email}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatCard label="Survived" value={String(roundsSurvived)} />
          <StatCard label="Wins" value={String(totalWins)} />
          <StatCard label="Status" value={isEliminated ? 'OUT' : 'ALIVE'} accent={!isEliminated} danger={isEliminated} />
        </View>

        {/* Pick history */}
        {picks.length > 0 && <LocalPicksSection picks={picks} />}

        {picks.length === 0 && (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>No picks yet for {competition.shortName}.</Text>
            <Text style={styles.emptySubtext}>Head to the Pick tab to make your first pick.</Text>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function LocalPicksSection({ picks }: { picks: ReturnType<typeof useGuestPicks>['picks'] }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>Pick History</Text>
      {[...picks].reverse().map((p, i) => (
        <PickBadge
          key={i}
          teamName={p.teamName}
          teamCrest={p.teamCrest}
          result={p.result}
          roundLabel={`Round ${p.roundId}`}
        />
      ))}
    </View>
  );
}

function StatCard({
  label,
  value,
  accent,
  danger,
}: {
  label: string;
  value: string;
  accent?: boolean;
  danger?: boolean;
}) {
  const color = accent ? Colors.primary : danger ? Colors.danger : Colors.text;
  return (
    <Card elevated style={styles.statCard}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing['4xl'], gap: Spacing.lg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: Spacing.base },
  title: { fontSize: Typography.xl, fontWeight: Typography.extrabold, color: Colors.text, letterSpacing: -0.5 },
  signOutBtn: { fontSize: Typography.sm, color: Colors.textMuted },
  profileSection: { flexDirection: 'row', alignItems: 'center', gap: Spacing.base },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  initials: { fontSize: 22, fontWeight: '800', color: Colors.background },
  displayName: { fontSize: Typography.lg, fontWeight: Typography.semibold, color: Colors.text },
  email: { fontSize: Typography.sm, color: Colors.textSecondary, marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: Spacing.sm },
  statCard: { flex: 1, alignItems: 'center', paddingVertical: Spacing.md, gap: 4 },
  statValue: { fontSize: Typography.xl, fontWeight: Typography.extrabold },
  statLabel: { fontSize: Typography.xs, color: Colors.textMuted, fontWeight: '600', letterSpacing: 0.5 },
  section: { gap: Spacing.sm },
  sectionLabel: { fontSize: Typography.xs, fontWeight: '700', color: Colors.textMuted, letterSpacing: 0.8, textTransform: 'uppercase' },
  emptyCard: {},
  emptyText: { fontSize: Typography.base, color: Colors.textSecondary },
  emptySubtext: { fontSize: Typography.sm, color: Colors.textMuted, marginTop: 4 },
  guestCard: { alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing['2xl'] },
  guestAvatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: Colors.surfaceElevated, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  guestAvatarText: { fontSize: 32, color: Colors.textMuted },
  guestName: { fontSize: Typography.lg, fontWeight: Typography.semibold, color: Colors.text },
  guestBody: { fontSize: Typography.base, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  signUpBtn: { width: '100%' },
});
