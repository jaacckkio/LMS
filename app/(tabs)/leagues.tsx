import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  Share,
  Modal,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LeagueCard } from '../../components/leagues/LeagueCard';
import { MemberRow } from '../../components/leagues/MemberRow';
import { CreateLeagueForm } from '../../components/leagues/CreateLeagueForm';
import { LeagueCreatedSheet } from '../../components/leagues/LeagueCreatedSheet';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Colors, Spacing, Radius, Typography } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import { useAuthModal } from '../../contexts/AuthModal';
import { useCompetition } from '../../hooks/useCompetition';
import { League, LeagueMember, MemberStatus } from '../../types';
import {
  getUserLeagues,
  getUserStatus,
  getLeagueMembers,
  createLeague,
  joinLeague,
} from '../../lib/leagueQueries';

type ModalState = 'create' | 'join' | 'detail' | null;

export default function LeaguesScreen() {
  const { user } = useAuth();
  const { show: showAuth } = useAuthModal();
  const { competition } = useCompetition();

  const [modal, setModal] = useState<ModalState>(null);
  const [selectedLeague, setSelectedLeague] = useState<League | null>(null);
  const [createdLeague, setCreatedLeague] = useState<League | null>(null);
  const [joinCode, setJoinCode] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  // Data from leagueQueries
  const [globalLeagues, setGlobalLeagues] = useState<League[]>([]);
  const [privateLeagues, setPrivateLeagues] = useState<League[]>([]);
  const [leagueStatuses, setLeagueStatuses] = useState<Record<string, MemberStatus | 'GUEST' | null>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Detail modal data
  const [detailMembers, setDetailMembers] = useState<LeagueMember[]>([]);

  const load = useCallback(async () => {
    try {
      const leagues = await getUserLeagues(user?.uid ?? null, null);

      const globals = leagues.filter((l) => l.type === 'GLOBAL');
      const privates = leagues.filter((l) => l.type === 'PRIVATE');
      setGlobalLeagues(globals);
      setPrivateLeagues(privates);

      // Load statuses for all leagues
      const statuses: Record<string, MemberStatus | 'GUEST' | null> = {};
      for (const l of leagues) {
        statuses[l.id] = user
          ? await getUserStatus(l.id, user.uid, null)
          : 'GUEST';
      }
      setLeagueStatuses(statuses);
    } catch {
      // silently fail — data will be empty
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [user, competition.id]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load();
  }, [load]);

  // Auth gate for create/join — creating leagues genuinely needs a user record
  const requireAuth = (action: () => void) => {
    if (!user) {
      showAuth('Sign up to create and join leagues');
    } else {
      action();
    }
  };

  const handleOpenDetail = useCallback(async (league: League) => {
    setSelectedLeague(league);
    setModal('detail');
    const members = await getLeagueMembers(league.id);
    setDetailMembers(members);
  }, []);

  const handleCreate = useCallback(async (params: { name: string; competitionId: string; stake: string }) => {
    if (!user) return;
    setCreateLoading(true);
    try {
      const league = await createLeague({
        name: params.name,
        competitionId: params.competitionId,
        stake: params.stake || undefined,
        userId: user.uid,
      });
      // Dismiss create modal, then open created sheet after a frame
      setModal(null);
      setCreateLoading(false);
      requestAnimationFrame(() => {
        setCreatedLeague(league);
      });
    } catch {
      Alert.alert('Error', 'Could not create league. Try again.');
      setCreateLoading(false);
    }
  }, [user]);

  const handleJoin = useCallback(async () => {
    if (joinCode.length !== 6) {
      Alert.alert('Invalid code', 'Enter a 6-character code');
      return;
    }
    setJoinLoading(true);
    try {
      const league = await joinLeague(joinCode, user?.uid ?? null, null);
      if (league) {
        setModal(null);
        setJoinCode('');
        load(); // refresh list
      } else {
        Alert.alert('Not found', 'No league found with that code.');
      }
    } catch {
      Alert.alert('Error', 'Could not join league. Try again.');
    } finally {
      setJoinLoading(false);
    }
  }, [joinCode, user, load]);

  const alive = detailMembers.filter((m) => m.status === 'ALIVE');
  const eliminated = detailMembers.filter((m) => m.status === 'ELIMINATED');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Leagues</Text>
          <View style={styles.actions}>
            <Button
              title="Join"
              onPress={() => requireAuth(() => { setJoinCode(''); setModal('join'); })}
              variant="secondary"
              size="sm"
            />
            <Button
              title="+ Create"
              onPress={() => requireAuth(() => setModal('create'))}
              size="sm"
            />
          </View>
        </View>

        {/* Guest banner */}
        {!user && (
          <Card style={styles.guestBanner}>
            <Text style={styles.guestText}>
              Sign up to create private leagues and compete with friends.
            </Text>
          </Card>
        )}

        {/* Global leagues */}
        {globalLeagues.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Global</Text>
            {globalLeagues.map((l) => (
              <LeagueCard
                key={l.id}
                league={l}
                userStatus={leagueStatuses[l.id] ?? null}
                onPress={() => handleOpenDetail(l)}
              />
            ))}
          </>
        )}

        {/* Private leagues */}
        {privateLeagues.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Private</Text>
            {privateLeagues.map((l) => (
              <LeagueCard
                key={l.id}
                league={l}
                userStatus={leagueStatuses[l.id] ?? null}
                onPress={() => handleOpenDetail(l)}
              />
            ))}
          </>
        )}
      </ScrollView>

      {/* ── Create League Modal ── */}
      <Modal visible={modal === 'create'} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create League</Text>
            <TouchableOpacity onPress={() => setModal(null)}>
              <Text style={styles.closeBtn}>{'\u2715'}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.modalBody}>
            <CreateLeagueForm
              onSubmit={handleCreate}
              loading={createLoading}
              defaultCompetitionId={competition.id}
            />
          </View>
        </SafeAreaView>
      </Modal>

      {/* ── League Created Sheet ── */}
      <LeagueCreatedSheet
        league={createdLeague}
        onDismiss={() => {
          setCreatedLeague(null);
          load(); // refresh list to show new league
        }}
      />

      {/* ── Join League Modal ── */}
      <Modal visible={modal === 'join'} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Join League</Text>
            <TouchableOpacity onPress={() => setModal(null)}>
              <Text style={styles.closeBtn}>{'\u2715'}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.modalBody}>
            <Text style={styles.fieldLabel}>6-CHARACTER CODE</Text>
            <TextInput
              style={[styles.input, styles.codeInput]}
              placeholder="ABC123"
              placeholderTextColor={Colors.textMuted}
              value={joinCode}
              onChangeText={(t) => setJoinCode(t.toUpperCase())}
              maxLength={6}
              autoCapitalize="characters"
              autoFocus
            />
            <Button title="Join" onPress={handleJoin} loading={joinLoading} />
          </View>
        </SafeAreaView>
      </Modal>

      {/* ── League Detail Modal ── */}
      <Modal visible={modal === 'detail'} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          {selectedLeague && (
            <>
              <View style={styles.modalHeader}>
                <View style={styles.detailTitleWrap}>
                  <Text style={styles.modalTitle}>{selectedLeague.name}</Text>
                  {selectedLeague.stake && (
                    <Text style={styles.detailStake}>{selectedLeague.stake}</Text>
                  )}
                  {selectedLeague.type === 'PRIVATE' && (
                    <Text style={styles.inviteCode}>Code: {selectedLeague.inviteCode}</Text>
                  )}
                </View>
                <TouchableOpacity onPress={() => { setModal(null); setDetailMembers([]); }}>
                  <Text style={styles.closeBtn}>{'\u2715'}</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.statsRow}>
                <Stat label="Alive" value={String(selectedLeague.aliveMembers)} color={Colors.primary} />
                <Stat label="Total" value={String(selectedLeague.totalMembers)} color={Colors.text} />
                <Stat label="Out" value={String(selectedLeague.totalMembers - selectedLeague.aliveMembers)} color={Colors.danger} />
              </View>

              <ScrollView contentContainerStyle={styles.memberList}>
                {alive.length > 0 && (
                  <>
                    <Text style={styles.sectionLabel}>Alive ({alive.length})</Text>
                    {alive.map((m, i) => (
                      <MemberRow key={m.id} member={m} rank={i + 1} pickHidden={true} />
                    ))}
                  </>
                )}
                {eliminated.length > 0 && (
                  <>
                    <Text style={[styles.sectionLabel, alive.length > 0 && { marginTop: Spacing.lg }]}>
                      Eliminated ({eliminated.length})
                    </Text>
                    {eliminated.map((m, i) => (
                      <MemberRow key={m.id} member={m} rank={alive.length + i + 1} pickHidden={false} />
                    ))}
                  </>
                )}
              </ScrollView>

              {selectedLeague.type === 'PRIVATE' && (
                <View style={styles.shareWrap}>
                  <Button
                    title="Share Invite"
                    onPress={() => Share.share({ message: `Join my Last Man Standing league! Code: ${selectedLeague.inviteCode}` })}
                    variant="secondary"
                  />
                </View>
              )}
            </>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.stat}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing['4xl'], gap: Spacing.sm },
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
  actions: { flexDirection: 'row', gap: Spacing.sm },
  guestBanner: { borderColor: Colors.primary + '30' },
  guestText: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  // Modals
  modalContainer: { flex: 1, backgroundColor: Colors.background },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: Spacing.xl,
  },
  modalTitle: { fontSize: Typography.lg, fontWeight: '800', color: Colors.text },
  detailTitleWrap: { flex: 1, marginRight: Spacing.md },
  detailStake: { fontSize: Typography.sm, color: Colors.textSecondary, fontStyle: 'italic', marginTop: 2 },
  inviteCode: { fontSize: Typography.sm, color: Colors.textMuted, marginTop: 2 },
  closeBtn: { fontSize: 18, color: Colors.textSecondary, padding: Spacing.sm },
  modalBody: { paddingHorizontal: Spacing.xl, gap: Spacing.md, flex: 1 },
  fieldLabel: {
    fontSize: Typography.xs,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 0.8,
  },
  input: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    color: Colors.text,
    fontSize: Typography.base,
  },
  codeInput: { textAlign: 'center', fontSize: 24, fontWeight: '800', letterSpacing: 6 },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
    marginBottom: Spacing.base,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statValue: { fontSize: Typography.xl, fontWeight: '800' },
  statLabel: { fontSize: Typography.xs, color: Colors.textMuted, fontWeight: '600', marginTop: 2 },
  memberList: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing['4xl'] },
  shareWrap: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xl },
});
