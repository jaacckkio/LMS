import React, { useState } from 'react';
import {
  View,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Text,
} from 'react-native';
import { Button } from '../ui/Button';
import { COMPETITIONS, CompetitionConfig } from '../../constants/competitions';
import { Colors, Spacing, Radius, Typography } from '../../constants/theme';
import { League } from '../../types';

interface Props {
  /** Called with the form values when "Create" is tapped. */
  onSubmit: (params: {
    name: string;
    competitionId: string;
    stake: string;
  }) => void | Promise<void>;
  loading?: boolean;
  /** Pre-selected competition (defaults to PL). */
  defaultCompetitionId?: string;
}

const STAKE_PLACEHOLDERS = [
  'Loser buys drinks',
  'Bragging rights',
  '\u00A320 each',
];

/**
 * Create League form.
 * - Name (required)
 * - "What's at stake?" (optional)
 * - Competition selector chips
 * - Create button (disabled until name is entered)
 */
export function CreateLeagueForm({
  onSubmit,
  loading = false,
  defaultCompetitionId = 'PL',
}: Props) {
  const [name, setName] = useState('');
  const [stake, setStake] = useState('');
  const [competitionId, setCompetitionId] = useState(defaultCompetitionId);

  const placeholder = STAKE_PLACEHOLDERS[Math.floor(Math.random() * STAKE_PLACEHOLDERS.length)];

  return (
    <View style={styles.container}>
      <Text style={styles.label}>LEAGUE NAME</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. The Office Pool"
        placeholderTextColor={Colors.textMuted}
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
        autoFocus
        maxLength={50}
      />

      <Text style={styles.label}>WHAT'S AT STAKE?</Text>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        value={stake}
        onChangeText={setStake}
        maxLength={80}
      />

      <Text style={styles.label}>COMPETITION</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        {COMPETITIONS.map((c) => (
          <CompChip
            key={c.id}
            comp={c}
            active={c.id === competitionId}
            onPress={() => setCompetitionId(c.id)}
          />
        ))}
      </ScrollView>

      <Button
        title="Create League"
        onPress={() => onSubmit({ name: name.trim(), competitionId, stake: stake.trim() })}
        disabled={!name.trim()}
        loading={loading}
        style={styles.btn}
      />
    </View>
  );
}

function CompChip({
  comp,
  active,
  onPress,
}: {
  comp: CompetitionConfig;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.chip, active && styles.chipActive]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Text style={styles.chipFlag}>{comp.flag}</Text>
      <Text style={[styles.chipName, active && styles.chipNameActive]}>
        {comp.shortName}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.md },
  label: {
    fontSize: Typography.xs,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 0.8,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    color: Colors.text,
    fontSize: Typography.base,
  },
  chips: { gap: Spacing.sm, paddingVertical: Spacing.xs },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.primary + '18',
    borderColor: Colors.primary + '60',
  },
  chipFlag: { fontSize: 14 },
  chipName: { fontSize: Typography.sm, fontWeight: '600', color: Colors.textSecondary },
  chipNameActive: { color: Colors.primary },
  btn: { marginTop: Spacing.sm },
});
