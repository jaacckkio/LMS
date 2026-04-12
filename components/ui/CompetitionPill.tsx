import React from 'react';
import {
  ScrollView,
  TouchableOpacity,
  View,
  StyleSheet,
  Text,
} from 'react-native';
import { COMPETITIONS, CompetitionConfig } from '../../constants/competitions';
import { Colors, Radius, Spacing } from '../../constants/theme';

interface Props {
  activeId: string;
  onSelect: (id: string) => void;
}

export function CompetitionPillRow({ activeId, onSelect }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.row}
    >
      {COMPETITIONS.map((c) => (
        <Pill key={c.id} competition={c} active={c.id === activeId} onPress={() => onSelect(c.id)} />
      ))}
    </ScrollView>
  );
}

function Pill({
  competition,
  active,
  onPress,
}: {
  competition: CompetitionConfig;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.pill, active && styles.pillActive]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Text style={styles.flag}>{competition.flag}</Text>
      <Text style={[styles.name, active && styles.nameActive]}>
        {competition.shortName}
      </Text>
      {active && <View style={[styles.underline, { backgroundColor: Colors.primary }]} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 0,   // prevents stretching to fill flex parent in non-scroll contexts
  },
  row: {
    paddingHorizontal: Spacing.xl,
    paddingRight: Spacing.xl + 24,  // prevent right-edge truncation
    gap: Spacing.sm,
    paddingVertical: Spacing.base,
    alignItems: 'center',
  },
  pill: {
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    position: 'relative',
    flexDirection: 'row',
    gap: 6,
  },
  pillActive: {
    borderColor: Colors.primary + '60',
    backgroundColor: Colors.primary + '20',
  },
  flag: { fontSize: 14 },
  name: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  nameActive: { color: Colors.primary },
  underline: {
    position: 'absolute',
    bottom: -3,
    left: '20%',
    right: '20%',
    height: 2,
    borderRadius: 1,
  },
});
