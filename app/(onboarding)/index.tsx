import { SafeAreaView } from 'react-native-safe-area-context';
/**
 * Onboarding Screen 1: Hook screen
 * "Pick one team. Survive the season."
 */
import React from 'react';
import { View, StyleSheet,  Image } from 'react-native';
import { router } from 'expo-router';
import { Text } from '../../components/ui/Text';
import { Button } from '../../components/ui/Button';
import { Colors, Spacing } from '../../constants/theme';

export default function HookScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        {/* Logo / brand mark */}
        <View style={styles.logoArea}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>LMS</Text>
          </View>
        </View>

        {/* Hero copy */}
        <View style={styles.hero}>
          <Text style={styles.headline}>Pick one team.{'\n'}Survive{'\n'}the season.</Text>
          <Text variant="body" color={Colors.textSecondary} style={styles.sub}>
            One Premier League pick per week. If your team doesn't win — you're out.
            Last one standing takes it all.
          </Text>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <Stat value="20" label="Teams" />
          <View style={styles.statDivider} />
          <Stat value="38" label="Gameweeks" />
          <View style={styles.statDivider} />
          <Stat value="1" label="Winner" />
        </View>

        {/* CTA */}
        <View style={styles.footer}>
          <Button
            title="Make My First Pick"
            onPress={() => router.push('/(onboarding)/fixtures')}
            style={styles.cta}
          />
          <Text variant="caption" color={Colors.textMuted} style={styles.legal}>
            Free to play · No credit card required
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text variant="caption" color={Colors.textSecondary}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  inner: { flex: 1, paddingHorizontal: Spacing.xl, justifyContent: 'space-between', paddingVertical: Spacing['2xl'] },
  logoArea: { alignItems: 'flex-start' },
  badge: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { fontSize: 18, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  hero: { gap: Spacing.base },
  headline: {
    fontSize: 52,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -2,
    lineHeight: 56,
  },
  sub: { maxWidth: 300, lineHeight: 22 },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  stat: { flex: 1, alignItems: 'center', gap: 2 },
  statValue: { fontSize: 28, fontWeight: '800', color: Colors.text },
  statDivider: { width: 1, height: 36, backgroundColor: Colors.border },
  footer: { gap: Spacing.md },
  cta: { width: '100%' },
  legal: { textAlign: 'center' },
});
