/**
 * Leagues Tab — list, create, join, and view league details
 */
import React, { useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
  Share,
  ScrollView,
  Modal as RNModal,
} from 'react-native';
import { Text } from '../../components/ui/Text';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { LeagueRow } from '../../components/leagues/LeagueRow';
import { TeamCrest } from '../../components/ui/TeamCrest';
import { Colors, Spacing, Radius } from '../../constants/theme';
import { getTeamById } from '../../constants/teams';
import type { League, LeagueMember } from '../../types';

// Mock data
const MOCK_LEAGUES: League[] = [
  { id: 'global', name: 'Global Pool', joinCode: 'GLOBAL', createdBy: 'system', createdAt: '', isGlobal: true, totalMembers: 14820, aliveMembers: 923 },
  { id: 'l1', name: 'The Office Banter Pool', joinCode: 'OFFICE', createdBy: 'u1', createdAt: '', isGlobal: false, totalMembers: 12, aliveMembers: 7 },
  { id: 'l2', name: 'Uni Mates', joinCode: 'UNI456', createdBy: 'u2', createdAt: '', isGlobal: false, totalMembers: 8, aliveMembers: 3 },
];

const MOCK_MEMBERS: LeagueMember[] = [
  { id: 'm1', userId: 'u1', leagueId: 'l1', username: 'You', status: 'alive', currentStreak: 6, longestStreak: 6, joinedAt: '' },
  { id: 'm2', userId: 'u2', leagueId: 'l1', username: 'jamie_fc', status: 'alive', currentStreak: 4, longestStreak: 8, joinedAt: '' },
  { id: 'm3', userId: 'u3', leagueId: 'l1', username: 'sarah_k', status: 'alive', currentStreak: 3, longestStreak: 3, joinedAt: '' },
  { id: 'm4', userId: 'u4', leagueId: 'l1', username: 'pedro99', status: 'eliminated', eliminatedWeek: 28, currentStreak: 0, longestStreak: 3, joinedAt: '' },
  { id: 'm5', userId: 'u5', leagueId: 'l1', username: 'kate_lfc', status: 'eliminated', eliminatedWeek: 27, currentStreak: 0, longestStreak: 2, joinedAt: '' },
];

type ModalType = 'create' | 'join' | 'detail' | null;

export default function LeaguesScreen() {
  const [modal, setModal] = useState<ModalType>(null);
  const [selectedLeague, setSelectedLeague] = useState<League | null>(null);
  const [newLeagueName, setNewLeagueName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [createdCode, setCreatedCode] = useState<string | null>(null);

  const openDetail = (league: League) => {
    setSelectedLeague(league);
    setModal('detail');
  };

  const handleCreate = () => {
    if (!newLeagueName.trim()) return;
    setLoading(true);
    setTimeout(() => {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      setCreatedCode(code);
      setLoading(false);
    }, 600);
  };

  const handleJoin = () => {
    if (joinCode.length !== 6) {
      Alert.alert('Invalid code', 'Enter a 6-character code');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setModal(null);
      setJoinCode('');
    }, 600);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text variant="heading">Leagues</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => setModal('join')}>
            <Text color={Colors.accent} weight="semibold">Join</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.headerBtn, styles.createBtn]} onPress={() => { setCreatedCode(null); setNewLeagueName(''); setModal('create'); }}>
            <Text color={Colors.text} weight="semibold">+ Create</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={MOCK_LEAGUES}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <LeagueRow league={item} onPress={() => openDetail(item)} />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text variant="subheading" color={Colors.textSecondary}>No leagues yet</Text>
            <Text variant="body" color={Colors.textMuted}>Create or join a league to compete with friends</Text>
          </View>
        }
      />

      {/* Create League Modal */}
      <RNModal visible={modal === 'create'} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text variant="subheading">Create League</Text>
            <TouchableOpacity onPress={() => setModal(null)}>
              <Text color={Colors.textSecondary}>✕</Text>
            </TouchableOpacity>
          </View>
          {createdCode ? (
            <View style={styles.modalBody}>
              <Text style={styles.successEmoji}>🏆</Text>
              <Text variant="heading">League Created!</Text>
              <Card elevated style={styles.codeCard}>
                <Text variant="label" color={Colors.textSecondary}>Join Code</Text>
                <Text style={styles.bigCode}>{createdCode}</Text>
                <Text color={Colors.textSecondary}>{newLeagueName}</Text>
              </Card>
              <Button
                title="Share Code"
                onPress={() => Share.share({ message: `Join my LMS league! Code: ${createdCode}` })}
                style={styles.fullBtn}
              />
              <Button title="Done" onPress={() => setModal(null)} variant="secondary" style={styles.fullBtn} />
            </View>
          ) : (
            <View style={styles.modalBody}>
              <Text variant="caption" color={Colors.textSecondary}>League Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. The Office Pool"
                placeholderTextColor={Colors.textMuted}
                value={newLeagueName}
                onChangeText={setNewLeagueName}
                autoFocus
              />
              <Button title="Create" onPress={handleCreate} loading={loading} style={styles.fullBtn} />
            </View>
          )}
        </SafeAreaView>
      </RNModal>

      {/* Join League Modal */}
      <RNModal visible={modal === 'join'} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text variant="subheading">Join League</Text>
            <TouchableOpacity onPress={() => setModal(null)}>
              <Text color={Colors.textSecondary}>✕</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.modalBody}>
            <Text variant="caption" color={Colors.textSecondary}>6-Character Code</Text>
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
            <Button title="Join" onPress={handleJoin} loading={loading} style={styles.fullBtn} />
          </View>
        </SafeAreaView>
      </RNModal>

      {/* League Detail Modal */}
      <RNModal visible={modal === 'detail'} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          {selectedLeague && (
            <>
              <View style={styles.modalHeader}>
                <View>
                  <Text variant="subheading">{selectedLeague.name}</Text>
                  {!selectedLeague.isGlobal && (
                    <Text variant="caption" color={Colors.textMuted}>
                      Code: {selectedLeague.joinCode}
                    </Text>
                  )}
                </View>
                <TouchableOpacity onPress={() => setModal(null)}>
                  <Text color={Colors.textSecondary}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.leagueStats}>
                <StatPill label="Remaining" value={`${selectedLeague.aliveMembers}`} color={Colors.alive} />
                <StatPill label="Total" value={`${selectedLeague.totalMembers}`} color={Colors.textSecondary} />
                <StatPill
                  label="Eliminated"
                  value={`${selectedLeague.totalMembers - selectedLeague.aliveMembers}`}
                  color={Colors.error}
                />
              </View>

              <ScrollView contentContainerStyle={styles.memberList}>
                <Text variant="label" color={Colors.textSecondary} style={styles.memberSection}>
                  Alive ({MOCK_MEMBERS.filter((m) => m.status === 'alive').length})
                </Text>
                {MOCK_MEMBERS.filter((m) => m.status === 'alive').map((m) => (
                  <MemberRow key={m.id} member={m} />
                ))}
                <Text variant="label" color={Colors.textSecondary} style={styles.memberSection}>
                  Eliminated ({MOCK_MEMBERS.filter((m) => m.status === 'eliminated').length})
                </Text>
                {MOCK_MEMBERS.filter((m) => m.status === 'eliminated').map((m) => (
                  <MemberRow key={m.id} member={m} />
                ))}
              </ScrollView>
            </>
          )}
        </SafeAreaView>
      </RNModal>
    </SafeAreaView>
  );
}

function StatPill({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.pill}>
      <Text style={{ fontSize: 22, fontWeight: '800', color }}>{value}</Text>
      <Text variant="caption" color={Colors.textMuted}>{label}</Text>
    </View>
  );
}

function MemberRow({ member }: { member: LeagueMember }) {
  const alive = member.status === 'alive';
  return (
    <View style={styles.memberRow}>
      <View style={[styles.memberDot, alive ? styles.memberDotAlive : styles.memberDotElim]} />
      <View style={styles.memberInfo}>
        <Text weight="semibold" style={alive ? undefined : styles.eliminatedText}>
          {member.username}
        </Text>
        {!alive && member.eliminatedWeek && (
          <Text variant="caption" color={Colors.textMuted}>
            Out GW{member.eliminatedWeek}
          </Text>
        )}
      </View>
      {alive && (
        <Text variant="caption" color={Colors.alive}>
          🔥 {member.currentStreak}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.xl, paddingVertical: Spacing.base },
  headerActions: { flexDirection: 'row', gap: Spacing.sm },
  headerBtn: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  createBtn: { backgroundColor: Colors.accent, borderRadius: Radius.sm },
  list: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing['4xl'] },
  empty: { alignItems: 'center', gap: Spacing.sm, marginTop: Spacing['4xl'] },
  modalContainer: { flex: 1, backgroundColor: Colors.background },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: Spacing.xl },
  modalBody: { paddingHorizontal: Spacing.xl, gap: Spacing.md, flex: 1 },
  fullBtn: {},
  input: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    color: Colors.text,
    fontSize: 16,
  },
  codeInput: { textAlign: 'center', fontSize: 22, fontWeight: '700', letterSpacing: 4 },
  successEmoji: { fontSize: 48, textAlign: 'center' },
  codeCard: { alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.xl },
  bigCode: { fontSize: 42, fontWeight: '800', letterSpacing: 6, color: Colors.accent },
  leagueStats: { flexDirection: 'row', gap: Spacing.sm, paddingHorizontal: Spacing.xl, marginBottom: Spacing.base },
  pill: { flex: 1, alignItems: 'center', backgroundColor: Colors.surface, borderRadius: Radius.md, paddingVertical: Spacing.md, gap: 4, borderWidth: 1, borderColor: Colors.border },
  memberList: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing['4xl'] },
  memberSection: { marginVertical: Spacing.sm },
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border },
  memberDot: { width: 10, height: 10, borderRadius: 5 },
  memberDotAlive: { backgroundColor: Colors.alive },
  memberDotElim: { backgroundColor: Colors.error },
  memberInfo: { flex: 1 },
  eliminatedText: { color: Colors.textMuted },
});
