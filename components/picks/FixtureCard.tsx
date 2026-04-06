import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { format } from 'date-fns';
import { Text } from '../ui/Text';
import { TeamCrest } from '../ui/TeamCrest';
import { FormBadge } from '../ui/FormBadge';
import { Colors, Spacing, Radius } from '../../constants/theme';
import { getTeamById } from '../../constants/teams';
import type { Fixture, FormResult } from '../../types';

interface Props {
  fixture: Fixture;
  selectedTeamId?: string | null;
  usedTeamIds: string[];
  onSelectTeam: (teamId: string) => void;
  locked?: boolean;
}

export function FixtureCard({ fixture, selectedTeamId, usedTeamIds, onSelectTeam, locked }: Props) {
  const homeTeam = getTeamById(fixture.homeTeamId);
  const awayTeam = getTeamById(fixture.awayTeamId);

  if (!homeTeam || !awayTeam) return null;

  const homeUsed = usedTeamIds.includes(fixture.homeTeamId);
  const awayUsed = usedTeamIds.includes(fixture.awayTeamId);
  const homeSelected = selectedTeamId === fixture.homeTeamId;
  const awaySelected = selectedTeamId === fixture.awayTeamId;

  const kickoff = new Date(fixture.kickoff);

  const TeamButton = ({
    teamId,
    crest,
    name,
    form,
    selected,
    used,
    usedWeek,
  }: {
    teamId: string;
    crest: string;
    name: string;
    form?: FormResult[];
    selected: boolean;
    used: boolean;
    usedWeek?: number;
  }) => (
    <TouchableOpacity
      style={[styles.teamBtn, selected && styles.teamBtnSelected, used && styles.teamBtnUsed]}
      onPress={() => !used && !locked && onSelectTeam(teamId)}
      disabled={used || locked}
      activeOpacity={0.75}
    >
      <TeamCrest uri={crest} size={48} dimmed={used && !selected} />
      <Text
        style={[styles.teamName, used && !selected && styles.teamNameUsed]}
        numberOfLines={1}
      >
        {name}
      </Text>
      {used ? (
        <Text style={styles.usedLabel}>Used</Text>
      ) : (
        <View style={styles.form}>
          {form?.map((r, i) => <FormBadge key={i} result={r} />)}
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TeamButton
        teamId={fixture.homeTeamId}
        crest={homeTeam.crest}
        name={homeTeam.shortName}
        form={fixture.homeForm}
        selected={homeSelected}
        used={homeUsed}
      />

      <View style={styles.middle}>
        <Text style={styles.vs}>VS</Text>
        <Text style={styles.time}>{format(kickoff, 'EEE HH:mm')}</Text>
      </View>

      <TeamButton
        teamId={fixture.awayTeamId}
        crest={awayTeam.crest}
        name={awayTeam.shortName}
        form={fixture.awayForm}
        selected={awaySelected}
        used={awayUsed}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  teamBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    gap: 6,
  },
  teamBtnSelected: {
    backgroundColor: Colors.accent + '22',
    borderWidth: 1.5,
    borderColor: Colors.accent,
    borderRadius: Radius.lg,
    margin: 2,
  },
  teamBtnUsed: { opacity: 0.5 },
  teamName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
  },
  teamNameUsed: { color: Colors.textMuted },
  usedLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  form: { flexDirection: 'row', gap: 3 },
  middle: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm,
    gap: 4,
  },
  vs: { fontSize: 11, fontWeight: '700', color: Colors.textMuted, letterSpacing: 1 },
  time: { fontSize: 11, color: Colors.textSecondary },
});
