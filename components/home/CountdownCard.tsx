import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useCountdown } from '../../hooks/useCountdown';
import { Text } from '../ui/Text';
import { Card } from '../ui/Card';
import { Colors, Spacing } from '../../constants/theme';

interface Props {
  deadline: Date;
  gameweek: number;
}

export function CountdownCard({ deadline, gameweek }: Props) {
  const { days, hours, minutes, seconds, total } = useCountdown(deadline);
  const isUrgent = total > 0 && total < 3 * 60 * 60 * 1000; // < 3h

  return (
    <Card elevated style={styles.card}>
      <Text variant="label" color={Colors.textSecondary}>
        Gameweek {gameweek} deadline
      </Text>
      {total <= 0 ? (
        <Text variant="subheading" color={Colors.error}>
          Picks are locked
        </Text>
      ) : (
        <View style={styles.timerRow}>
          <TimeUnit value={days} label="D" urgent={isUrgent} />
          <Text style={styles.sep} color={Colors.textMuted}>:</Text>
          <TimeUnit value={hours} label="H" urgent={isUrgent} />
          <Text style={styles.sep} color={Colors.textMuted}>:</Text>
          <TimeUnit value={minutes} label="M" urgent={isUrgent} />
          <Text style={styles.sep} color={Colors.textMuted}>:</Text>
          <TimeUnit value={seconds} label="S" urgent={isUrgent} />
        </View>
      )}
    </Card>
  );
}

function TimeUnit({ value, label, urgent }: { value: number; label: string; urgent: boolean }) {
  return (
    <View style={styles.unit}>
      <Text
        variant="heading"
        color={urgent ? Colors.accent : Colors.text}
        style={styles.value}
      >
        {String(value).padStart(2, '0')}
      </Text>
      <Text style={styles.unitLabel} color={Colors.textMuted}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: Spacing.md },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: Spacing.sm,
  },
  unit: { alignItems: 'center', minWidth: 44 },
  value: { fontSize: 32, lineHeight: 36, fontWeight: '800' },
  unitLabel: { fontSize: 10, letterSpacing: 0.5 },
  sep: { fontSize: 28, fontWeight: '300', marginBottom: 8 },
});
