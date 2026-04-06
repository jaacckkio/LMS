import { SafeAreaView } from 'react-native-safe-area-context';
/**
 * Onboarding Screen 4: Create or Join a league
 */
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import { router } from 'expo-router';
import { Text } from '../../components/ui/Text';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Colors, Spacing, Radius } from '../../constants/theme';

type Tab = 'create' | 'join';

export default function LeagueSetupScreen() {
  const [tab, setTab] = useState<Tab>('create');
  const [leagueName, setLeagueName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [createdCode, setCreatedCode] = useState<string | null>(null);

  const generateCode = () =>
    Math.random().toString(36).substring(2, 8).toUpperCase();

  const handleCreate = async () => {
    if (!leagueName.trim()) {
      Alert.alert('Name required', 'Give your league a name');
      return;
    }
    setLoading(true);
    // TODO: persist to Supabase
    const code = generateCode();
    setTimeout(() => {
      setLoading(false);
      setCreatedCode(code);
    }, 800);
  };

  const handleShareCode = async () => {
    if (!createdCode) return;
    await Share.share({
      message: `Join my Last Man Standing league! Code: ${createdCode}\nDownload: https://lastmanstanding.app`,
      title: `Join ${leagueName}`,
    });
  };

  const handleJoin = async () => {
    if (joinCode.trim().length !== 6) {
      Alert.alert('Invalid code', 'Enter a 6-character league code');
      return;
    }
    setLoading(true);
    // TODO: look up and join via Supabase
    setTimeout(() => {
      setLoading(false);
      router.replace('/(tabs)');
    }, 800);
  };

  const handleSkip = () => router.replace('/(tabs)');

  if (createdCode) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.inner}>
          <Text style={styles.title}>League Created!</Text>
          <Text variant="body" color={Colors.textSecondary}>
            Share this code with your friends so they can join.
          </Text>

          <Card elevated style={styles.codeCard}>
            <Text variant="label" color={Colors.textSecondary}>Join Code</Text>
            <Text style={styles.codeText}>{createdCode}</Text>
            <Text variant="caption" color={Colors.textMuted}>{leagueName}</Text>
          </Card>

          <Button title="Share League Code" onPress={handleShareCode} style={styles.btn} />
          <Button title="Continue to Home" onPress={handleSkip} variant="secondary" style={styles.btn} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <View style={styles.hero}>
          <Text style={styles.title}>Play with friends?</Text>
          <Text variant="body" color={Colors.textSecondary}>
            Create a private league or join one. You're always in the Global Pool too.
          </Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, tab === 'create' && styles.tabActive]}
            onPress={() => setTab('create')}
          >
            <Text style={[styles.tabText, tab === 'create' && styles.tabTextActive]}>
              Create
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, tab === 'join' && styles.tabActive]}
            onPress={() => setTab('join')}
          >
            <Text style={[styles.tabText, tab === 'join' && styles.tabTextActive]}>
              Join
            </Text>
          </TouchableOpacity>
        </View>

        {tab === 'create' ? (
          <View style={styles.form}>
            <Text variant="caption" color={Colors.textSecondary}>League Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. The Office Banter Pool"
              placeholderTextColor={Colors.textMuted}
              value={leagueName}
              onChangeText={setLeagueName}
              autoFocus
              maxLength={40}
            />
            <Button title="Create League" onPress={handleCreate} loading={loading} style={styles.btn} />
          </View>
        ) : (
          <View style={styles.form}>
            <Text variant="caption" color={Colors.textSecondary}>Enter 6-Character Code</Text>
            <TextInput
              style={[styles.input, styles.codeInput]}
              placeholder="ABC123"
              placeholderTextColor={Colors.textMuted}
              value={joinCode}
              onChangeText={(t) => setJoinCode(t.toUpperCase())}
              autoCapitalize="characters"
              maxLength={6}
              autoFocus
            />
            <Button title="Join League" onPress={handleJoin} loading={loading} style={styles.btn} />
          </View>
        )}

        <Button
          title="Skip — Play in Global Pool only"
          onPress={handleSkip}
          variant="ghost"
          style={styles.skipBtn}
          textStyle={styles.skipText}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  inner: { flex: 1, paddingHorizontal: Spacing.xl, paddingVertical: Spacing['2xl'], gap: Spacing.lg },
  hero: { gap: Spacing.sm },
  title: { fontSize: 36, fontWeight: '800', color: Colors.text, letterSpacing: -1 },
  tabs: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tab: { flex: 1, paddingVertical: Spacing.sm, alignItems: 'center', borderRadius: Radius.sm },
  tabActive: { backgroundColor: Colors.accent },
  tabText: { fontWeight: '600', color: Colors.textSecondary, fontSize: 15 },
  tabTextActive: { color: Colors.text },
  form: { gap: Spacing.sm },
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
  codeInput: { fontSize: 22, fontWeight: '700', letterSpacing: 4, textAlign: 'center' },
  btn: { marginTop: Spacing.xs },
  skipBtn: { marginTop: 'auto' },
  skipText: { color: Colors.textMuted, fontSize: 13 },
  codeCard: { alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.xl },
  codeText: { fontSize: 48, fontWeight: '800', letterSpacing: 6, color: Colors.accent },
});
