import React, { useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LeagueCard } from '../../components/leagues/LeagueCard';
import { MemberRow } from '../../components/leagues/MemberRow';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Colors, Spacing, Radius, Typography } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import { useAuthModal } from '../../contexts/AuthModal';
import { useCompetition } from '../../hooks/useCompetition';
import { League, LeagueMember } from '../../types';

// Mock leagues — replace with Supabase queries
const MOCK_GLOBAL: League = {
  id: 'global',
  name: 'Global LMS — Premier League',
  competitionId: 'PL',
  type: 'GLOBAL',
  inviteCode: 'GLOBAL',
  createdBy: 'system',
  createdAt: '',
  totalMembers: 18_420,
  aliveMembers: 1_203,
};

const MOCK_PRIVATE: League[] = [
  {
    id: 'l1',
    name: 'The Office Pool',
    competitionId: 'PL',
    type: 'PRIVATE',
    inviteCode: 'OFF1CE',
    createdBy: 'u1',
    createdAt: '',
    totalMembers: 14,
    aliveMembers: 8,
  },
];

const MOCK_MEMBERS: LeagueMember[] = [
  { id: 'm1', leagueId: 'l1', userId: 'u1', deviceId: null, displayName: 'You', status: 'ALIVE', roundsSurvived: 6, joinedAt: '' },
  { id: 'm2', leagueId: 'l1', userId: 'u2', deviceId: null, displayName: 'Jamie', status: 'ALIVE', roundsSurvived: 5, joinedAt: '' },
  { id: 'm3', leagueId: 'l1', userId: 'u3', deviceId: null, displayName: 'Sarah', status: 'ALIVE', roundsSurvived: 4, joinedAt: '' },
  { id: 'm4', leagueId: 'l1', userId: 'u4', deviceId: null, displayName: 'Pedro', status: 'ELIMINATED', eliminatedRound: 28, roundsSurvived: 3, joinedAt: '' },
  { id: 'm5', leagueId: 'l1', userId: 'u5', deviceId: null, displayName: 'Kate', status: 'ELIMINATED', eliminatedRound: 27, roundsSurvived: 2, joinedAt: '' },
];

type ModalType = 'create' | 'join' | 'detail' | null;

export default function LeaguesScreen() {
  const { user } = useAuth();
  const { show: showAuth } = useAuthModal();
  const { competition } = useCompetition();

  const [modal, setModal] = useState<ModalType>(null);
  const [selectedLeague, setSelectedLeague] = useState<League | null>(null);
  const [newName, setNewName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [createdCode, setCreatedCode] = useState<string | null>(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);

  const requireAuth = (action: () => void) => {
    if (!user) {
      showAuth('Sign up to create and join leagues');
    } else {
      action();
    }
  };

  const handleCreate = () => {
    if (!newName.trim()) return;
    setCreateLoading(true);
    setTimeout(() => {
      setCreatedCode(Math.random().toString(36).slice(2, 8).toUpperCase());
      setCreateLoading(false);
    }, 600);
  };

  const handleJoin = () => {
    if (joinCode.length !== 6) {
      Alert.alert('Invalid code', 'Enter a 6-character code');
      return;
    }
    setJoinLoading(true);
    setTimeout(() => {
      setJoinLoading(false);
      setModal(null);
      setJoinCode('');
    }, 600);
  };

  const alive = MOCK_MEMBERS.filter((m) => m.status === 'ALIVE');
  const eliminated = MOCK_MEMBERS.filter((m) => m.status === 'ELIMINATED');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Leagues</Text>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.joinBtn} onPress={() => requireAuth(() => { setJoinCode(''); setModal('join'); })}>
              <Text style={styles.joinBtnText}>Join</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.createBtn} onPress={() => requireAuth(() => { setCreatedCode(null); setNewName(''); setModal('create'); })}>
              <Text style={styles.createBtnText}>+ Create</Text>
            </TouchableOpacity>
          </View>
        </View>

        {!user && (
          <Card style={styles.guestBanner}>
            <Text style={styles.guestText}>
              Sign up to create private leagues and compete with friends.
            </Text>
            <TouchableOpacity onPress={() => showAuth('Join to create leagues')}>
              <Text style={styles.guestCta}>Sign up free →</Text>
            </TouchableOpacity>
          </Card>
        )}

        {/* Global league — always shown */}
        <Text style={styles.sectionLabel}>Global</Text>
        <LeagueCard
          league={MOCK_GLOBAL}
          userStatus={user ? 'ALIVE' : 'GUEST'}
          onPress={() => { setSelectedLeague(MOCK_GLOBAL); setModal('detail'); }}
        />

        {/* Private leagues */}
        {user && MOCK_PRIVATE.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Private</Text>
            {MOCK_PRIVATE.map((l) => (
              <LeagueCard
                key={l.id}
                league={l}
                userStatus="ALIVE"
                onPress={() => { setSelectedLeague(l); setModal('detail'); }}
              />
            ))}
          </>
        )}
      </ScrollView>

      {/* Create League Modal */}
      <Modal visible={modal === 'create'} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create League</Text>
            <TouchableOpacity onPress={() => setModal(null)}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.modalBody}>
            {createdCode ? (
              <View style={styles.codeResult}>
                <Text style={styles.successEmoji}>🏆</Text>
                <Text style={styles.successTitle}>League Created!</Text>
                <Card elevated style={styles.codeCard}>
                  <Text style={styles.codeLabel}>Share this code</Text>
                  <Text style={styles.bigCode}>{createdCode}</Text>
                  <Text style={styles.codeName}>{newName}</Text>
                </Card>
                <Button title="Share Code" onPress={() => Share.share({ message: `Join my LMS league! Code: ${createdCode}` })} style={styles.fullBtn} />
                <Button title="Done" onPress={() => setModal(null)} variant="secondary" style={styles.fullBtn} />
              </View>
            ) : (
              <>
                <Text style={styles.fieldLabel}>League Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. The Office Pool"
                  placeholderTextColor={Colors.textMuted}
                  value={newName}
                  onChangeText={setNewName}
                  autoFocus
                />
                <Button title="Create" onPress={handleCreate} loading={createLoading} style={styles.fullBtn} />
              </>
            )}
          </View>
        </SafeAreaView>
      </Modal>

      {/* Join League Modal */}
      <Modal visible={modal === 'join'} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Join League</Text>
            <TouchableOpacity onPress={() => setModal(null)}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.modalBody}>
            <Text style={styles.fieldLabel}>6-Character Code</Text>
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
            <Button title="Join" onPress={handleJoin} loading={joinLoading} style={styles.fullBtn} />
          </View>
        </SafeAreaView>
      </Modal>

      {/* League Detail Modal */}
      <Modal visible={modal === 'detail'} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          {selectedLeague && (
            <>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>{selectedLeague.name}</Text>
                  {selectedLeague.type === 'PRIVATE' && (
                    <Text style={styles.inviteCode}>Code: {selectedLeague.inviteCode}</Text>
                  )}
                </View>
                <TouchableOpacity onPress={() => setModal(null)}>
                  <Text style={styles.closeBtn}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.statsRow}>
                <Stat label="Alive" value={String(selectedLeague.aliveMembers)} color={Colors.primary} />
                <Stat label="Total" value={String(selectedLeague.totalMembers)} color={Colors.text} />
                <Stat label="Out" value={String(selectedLeague.totalMembers - selectedLeague.aliveMembers)} color={Colors.danger} />
              </View>

              <ScrollView contentContainerStyle={styles.memberList}>
                <Text style={styles.sectionLabel}>Alive ({alive.length})</Text>
                {alive.map((m, i) => (
                  <MemberRow key={m.id} member={m} rank={i + 1} pickHidden={true} />
                ))}
                <Text style={[styles.sectionLabel, { marginTop: Spacing.lg }]}>
                  Eliminated ({eliminated.length})
                </Text>
                {eliminated.map((m, i) => (
                  <MemberRow key={m.id} member={m} rank={alive.length + i + 1} pickHidden={false} />
                ))}
              </ScrollView>

              {selectedLeague.type === 'PRIVATE' && (
                <View style={styles.shareWrap}>
                  <Button
                    title="Share Invite"
                    onPress={() => Share.share({ message: `Join my LMS league! Code: ${selectedLeague.inviteCode}` })}
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: Spacing.base },
  title: { fontSize: Typography.xl, fontWeight: Typography.extrabold, color: Colors.text, letterSpacing: -0.5 },
  actions: { flexDirection: 'row', gap: Spacing.sm },
  joinBtn: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border },
  joinBtnText: { fontSize: Typography.sm, fontWeight: '600', color: Colors.textSecondary },
  createBtn: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.md, backgroundColor: Colors.primary },
  createBtnText: { fontSize: Typography.sm, fontWeight: '700', color: Colors.background },
  guestBanner: { borderColor: Colors.primary + '30' },
  guestText: { fontSize: Typography.base, color: Colors.textSecondary, lineHeight: 22, marginBottom: Spacing.sm },
  guestCta: { fontSize: Typography.base, fontWeight: '700', color: Colors.primary },
  sectionLabel: { fontSize: Typography.xs, fontWeight: '700', color: Colors.textMuted, letterSpacing: 0.8, textTransform: 'uppercase', marginTop: Spacing.sm },
  modalContainer: { flex: 1, backgroundColor: Colors.background },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: Spacing.xl },
  modalTitle: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.text },
  inviteCode: { fontSize: Typography.sm, color: Colors.textMuted, marginTop: 2 },
  closeBtn: { fontSize: 18, color: Colors.textSecondary, padding: Spacing.sm },
  modalBody: { paddingHorizontal: Spacing.xl, gap: Spacing.md, flex: 1 },
  fieldLabel: { fontSize: Typography.sm, color: Colors.textSecondary, fontWeight: '600' },
  input: {
    backgroundColor: Colors.surfaceElevated, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.md, color: Colors.text, fontSize: Typography.base,
  },
  codeInput: { textAlign: 'center', fontSize: 24, fontWeight: '800', letterSpacing: 6 },
  fullBtn: {},
  codeResult: { alignItems: 'center', gap: Spacing.md },
  successEmoji: { fontSize: 48 },
  successTitle: { fontSize: Typography.xl, fontWeight: Typography.bold, color: Colors.text },
  codeCard: { width: '100%', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.xl },
  codeLabel: { fontSize: Typography.xs, fontWeight: '700', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  bigCode: { fontSize: 44, fontWeight: '800', letterSpacing: 8, color: Colors.primary },
  codeName: { fontSize: Typography.sm, color: Colors.textSecondary },
  statsRow: { flexDirection: 'row', paddingHorizontal: Spacing.xl, gap: Spacing.sm, marginBottom: Spacing.base },
  stat: { flex: 1, alignItems: 'center', backgroundColor: Colors.surface, borderRadius: Radius.md, paddingVertical: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  statValue: { fontSize: Typography.xl, fontWeight: Typography.extrabold },
  statLabel: { fontSize: Typography.xs, color: Colors.textMuted, fontWeight: '600', marginTop: 2 },
  memberList: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing['4xl'] },
  shareWrap: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xl },
});
