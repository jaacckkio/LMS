import React from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { PickBadge } from '../../components/ui/PickBadge';
import { Colors, Spacing, Radius, Typography, Fonts } from '../../constants/theme';
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
  const initials = displayName.slice(0, 1).toUpperCase();

  const totalPicks = picks.length;
  const totalWins = picks.filter((p) => p.result === 'WIN').length;
  const winRate = totalPicks > 0 ? Math.round((totalWins / totalPicks) * 100) : 0;
  const isEliminated = picks.some((p) => p.result === 'LOSS');
  const roundsSurvived = picks.filter((p) => p.result === 'WIN' || p.result === 'DRAW').length;

  // Stubbed stats — not yet derivable from local data
  const longestStreak = roundsSurvived; // stub: equals current survival count
  const leaguesWon = 0; // stub: requires backend

  const joinDate = user?.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString('en-GB', {
        month: 'short',
        year: 'numeric',
      })
    : null;

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
            {/* GUEST badge avatar */}
            <View style={styles.guestAvatar}>
              <Text style={styles.guestAvatarText}>GUEST</Text>
            </View>

            <Text style={styles.guestName}>Playing as Guest</Text>

            {/* Greyed-out mini stat row */}
            <Text style={styles.miniStats}>
              0 picks · 0 leagues · 0 weeks survived
            </Text>

            {/* Unlock preview */}
            <Text style={styles.unlockPreview}>
              Pick history · League membership · Cross-device sync · Survival streak
            </Text>

            <Button
              title="Start Your Streak"
              onPress={() => showAuth('Create an account to save your progress')}
              style={styles.fullWidth}
            />
            <Button
              title="Sign In"
              onPress={() => showAuth('Sign in to your account')}
              variant="ghost"
              style={styles.fullWidth}
            />
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

        {/* Avatar + name */}
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.initials}>{initials}</Text>
          </View>
          <View>
            <Text style={styles.displayName}>{displayName}</Text>
            {joinDate && <Text style={styles.joinDate}>Joined {joinDate}</Text>}
          </View>
        </View>

        {/* 2x2 stats grid */}
        <View style={styles.statsGrid}>
          <StatCard label="Total Picks" value={String(totalPicks)} />
          <StatCard label="Win Rate" value={`${winRate}%`} />
          <StatCard label="Best Streak" value={String(longestStreak)} />
          <StatCard label="Leagues Won" value={String(leaguesWon)} />
        </View>

        {/* Status badge */}
        <View style={[styles.statusBadge, { backgroundColor: isEliminated ? Colors.danger + '20' : Colors.primary + '20' }]}>
          <Text style={[styles.statusText, { color: isEliminated ? Colors.danger : Colors.primary }]}>
            {isEliminated ? 'ELIMINATED' : 'ALIVE'}
          </Text>
          <Text style={styles.statusSub}>
            {roundsSurvived} round{roundsSurvived !== 1 ? 's' : ''} survived · {competition.shortName}
          </Text>
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

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card elevated style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing['4xl'], gap: Spacing.lg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.base,
  },
  title: {
    fontSize: Typography.xl,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  signOutBtn: { fontSize: Typography.sm, color: Colors.textMuted },

  // ── Signed-in view ──
  profileSection: { flexDirection: 'row', alignItems: 'center', gap: Spacing.base },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontSize: 24,
    fontFamily: Fonts.display,
    fontWeight: '400',
    color: Colors.background,
  },
  displayName: {
    fontSize: Typography.lg,
    fontWeight: '600',
    color: Colors.text,
  },
  joinDate: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  // 2x2 stats grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  statCard: {
    flex: 1,
    minWidth: '45%' as unknown as number,
    alignItems: 'center',
    paddingVertical: Spacing.base,
    gap: 4,
  },
  statValue: {
    fontSize: Typography['3xl'],
    fontFamily: Fonts.display,
    fontWeight: '400',
    color: Colors.text,
    fontVariant: ['tabular-nums'],
  },
  statLabel: {
    fontSize: Typography.xs,
    color: Colors.textMuted,
    fontWeight: '600',
    letterSpacing: 0.5,
  },

  // Status badge
  statusBadge: {
    borderRadius: Radius.md,
    padding: Spacing.base,
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: Typography.sm,
    fontWeight: '800',
    letterSpacing: 1,
  },
  statusSub: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    fontWeight: '600',
  },

  // ── Guest view ──
  guestCard: { alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing['2xl'] },
  guestAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestAvatarText: {
    fontSize: 14,
    fontFamily: Fonts.display,
    fontWeight: '400',
    color: Colors.textMuted,
    letterSpacing: 1,
  },
  guestName: {
    fontSize: Typography.lg,
    fontWeight: '600',
    color: Colors.text,
  },
  miniStats: {
    fontSize: Typography.sm,
    color: Colors.textMuted,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  unlockPreview: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  fullWidth: { width: '100%' as unknown as number },

  // ── Shared ──
  section: { gap: Spacing.sm },
  sectionLabel: {
    fontSize: Typography.xs,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  emptyCard: {},
  emptyText: { fontSize: Typography.base, color: Colors.textSecondary },
  emptySubtext: { fontSize: Typography.sm, color: Colors.textMuted, marginTop: 4 },
});
