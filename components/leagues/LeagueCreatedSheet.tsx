import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Animated,
  Linking,
  Platform,
  Share,
  Text,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { Button } from '../ui/Button';
import { Colors, Spacing, Radius, Typography, Fonts, BrandColors } from '../../constants/theme';
import { League } from '../../types';
import { getCompetition } from '../../constants/competitions';

const SHEET_HEIGHT = 520;

interface Props {
  league: League | null;
  onDismiss: () => void;
}

/**
 * "League Created" bottom sheet.
 * Shows league card preview, invite code, and contextual share buttons.
 * Modal + Animated + translateY spring pattern (no Reanimated).
 */
export function LeagueCreatedSheet({ league, onDismiss }: Props) {
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const visible = !!league;

  const [copied, setCopied] = useState(false);
  const [whatsappAvailable, setWhatsappAvailable] = useState(false);

  useEffect(() => {
    if (visible) {
      setCopied(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        damping: 20,
        stiffness: 200,
      }).start();

      // Check WhatsApp availability
      Linking.canOpenURL('whatsapp://send').then(setWhatsappAvailable).catch(() => {});
    } else {
      Animated.timing(translateY, {
        toValue: SHEET_HEIGHT,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!league) return null;

  const competition = getCompetition(league.competitionId);

  const shareMessage = [
    `\u{1F480} I just started a Last Man Standing league: ${league.name}`,
    `Pick one team to win each week. Pick wrong, you're out. Last one standing wins${league.stake ? ` ${league.stake}` : ''}.`,
    `Join with code ${league.inviteCode}`,
  ].join('\n');

  const handleWhatsApp = () => {
    Linking.openURL(`whatsapp://send?text=${encodeURIComponent(shareMessage)}`);
  };

  const handleMessages = () => {
    const url = Platform.OS === 'ios'
      ? `sms:&body=${encodeURIComponent(shareMessage)}`
      : `sms:?body=${encodeURIComponent(shareMessage)}`;
    Linking.openURL(url);
  };

  const handleNativeShare = async () => {
    await Share.share({ message: shareMessage });
  };

  const handleCopyCode = async () => {
    await Clipboard.setStringAsync(league.inviteCode);
    setCopied(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onDismiss} statusBarTranslucent>
      <TouchableWithoutFeedback onPress={onDismiss}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
        <View style={styles.handle} />

        {/* Title row */}
        <View style={styles.titleRow}>
          <Text style={styles.title}>League Created</Text>
          <TouchableOpacity onPress={onDismiss} hitSlop={12}>
            <Text style={styles.close}>{'\u2715'}</Text>
          </TouchableOpacity>
        </View>

        {/* League preview card */}
        <View style={styles.previewCard}>
          <Text style={styles.previewName}>{league.name}</Text>
          {league.stake ? <Text style={styles.previewStake}>{league.stake}</Text> : null}
          <View style={styles.previewRow}>
            <Text style={styles.previewFlag}>{competition.flag}</Text>
            <Text style={styles.previewComp}>{competition.shortName}</Text>
          </View>
          <Text style={styles.previewMembers}>1/1 players</Text>
          <Text style={styles.previewWaiting}>Waiting for friends...</Text>
          <View style={[styles.recruitPill]}>
            <Text style={styles.recruitText}>RECRUITING</Text>
          </View>
        </View>

        {/* Invite code */}
        <View style={styles.codeBlock}>
          <Text style={styles.codeLabel}>INVITE CODE</Text>
          <TouchableOpacity onPress={handleCopyCode}>
            <Text style={styles.codeText}>{league.inviteCode}</Text>
            <Text style={styles.codeTap}>{copied ? 'Copied!' : 'Tap to copy'}</Text>
          </TouchableOpacity>
        </View>

        {/* Share buttons */}
        <View style={styles.shareStack}>
          {whatsappAvailable && (
            <Button
              title="Share to WhatsApp"
              onPress={handleWhatsApp}
              style={{ ...styles.shareBtn, backgroundColor: BrandColors.whatsapp }}
              textStyle={{ color: Colors.text }}
              variant="primary"
            />
          )}
          <Button
            title={Platform.OS === 'ios' ? 'Share to iMessage' : 'Share to Messages'}
            onPress={handleMessages}
            style={{ ...styles.shareBtn, backgroundColor: BrandColors.iMessage }}
            textStyle={{ color: Colors.text }}
            variant="primary"
          />
          <Button
            title="Share..."
            onPress={handleNativeShare}
            variant="secondary"
            style={styles.shareBtn}
          />
          <Button
            title={copied ? 'Code Copied!' : 'Copy Invite Code'}
            onPress={handleCopyCode}
            variant="ghost"
            style={styles.shareBtn}
          />
        </View>

        {/* Done */}
        <Button title="Done" onPress={onDismiss} variant="ghost" />
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: Colors.overlay,
  },
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.surfaceElevated,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing['4xl'],
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.xl,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.3,
  },
  close: {
    fontSize: Typography.lg,
    color: Colors.textMuted,
  },
  // Preview card
  previewCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.base,
    gap: 4,
    marginBottom: Spacing.md,
  },
  previewName: {
    fontSize: Typography.md,
    fontWeight: '800',
    fontFamily: Fonts.display,
    color: Colors.text,
    letterSpacing: 0.5,
  },
  previewStake: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  previewFlag: { fontSize: 14 },
  previewComp: { fontSize: Typography.sm, color: Colors.textSecondary },
  previewMembers: {
    fontSize: Typography.sm,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 6,
  },
  previewWaiting: {
    fontSize: Typography.xs,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  recruitPill: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.warning + '20',
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    marginTop: 6,
  },
  recruitText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.warning,
    letterSpacing: 0.5,
  },
  // Code block
  codeBlock: { alignItems: 'center', marginBottom: Spacing.md, gap: 4 },
  codeLabel: {
    fontSize: Typography.xs,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 1,
  },
  codeText: {
    fontSize: Typography['3xl'],
    fontWeight: '800',
    fontFamily: Fonts.display,
    color: Colors.text,
    letterSpacing: 6,
    textAlign: 'center',
  },
  codeTap: {
    fontSize: Typography.xs,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  // Share
  shareStack: { gap: Spacing.sm, marginBottom: Spacing.sm },
  shareBtn: { width: '100%' },
});
