import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useCountdown } from '../../hooks/useCountdown';
import { Colors, Spacing } from '../../constants/theme';

interface Props {
  deadline: Date;
  size?: 'sm' | 'lg';
}

export function CountdownTimer({ deadline, size = 'lg' }: Props) {
  const { days, hours, minutes, seconds, total } = useCountdown(deadline);

  const isUrgent = total > 0 && total < 60 * 60 * 1000;      // < 1 hour → amber
  const isCritical = total > 0 && total < 10 * 60 * 1000;    // < 10 mins → red
  const expired = total <= 0;

  const color = expired
    ? Colors.textMuted
    : isCritical
    ? Colors.danger
    : isUrgent
    ? Colors.warning
    : Colors.text;

  if (size === 'sm') {
    const display = days > 0
      ? `${days}d ${pad(hours)}h`
      : `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    return (
      <Text style={[styles.smText, { color }]}>
        {expired ? 'Locked' : display}
      </Text>
    );
  }

  return (
    <View style={styles.row}>
      {days > 0 && (
        <>
          <Unit value={days} label="D" color={color} />
          <Sep color={color} />
        </>
      )}
      <Unit value={hours} label="H" color={color} />
      <Sep color={color} />
      <Unit value={minutes} label="M" color={color} />
      <Sep color={color} />
      <Unit value={seconds} label="S" color={color} />
    </View>
  );
}

function Unit({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <View style={styles.unit}>
      <Text style={[styles.digit, { color }]}>{pad(value)}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

function Sep({ color }: { color: string }) {
  return <Text style={[styles.sep, { color }]}>:</Text>;
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  unit: { alignItems: 'center', minWidth: 48 },
  digit: {
    fontSize: 36,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    letterSpacing: -1,
    lineHeight: 40,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textMuted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  sep: {
    fontSize: 30,
    fontWeight: '300',
    marginBottom: 10,
  },
  smText: {
    fontSize: 13,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
});
