import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { InteractionType } from '../types/models';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { shadows } from '../theme/shadows';

type Action = {
  type: InteractionType;
  label: string;
  symbol: string;
};

const actions: Action[] = [
  { type: 'hug', label: '안아주기', symbol: '♡' },
  { type: 'kiss', label: '뽀뽀하기', symbol: '♥' },
  { type: 'pat', label: '쓰다듬기', symbol: '⌁' }
];

type Props = {
  visible: boolean;
  onPress: (type: InteractionType) => void;
};

export default function InteractionButton({ visible, onPress }: Props) {
  if (!visible) {
    return null;
  }

  return (
    <View style={styles.wrap}>
      {actions.map((action) => (
        <Pressable key={action.type} style={styles.button} onPress={() => onPress(action.type)}>
          <Text style={styles.symbol}>{action.symbol}</Text>
          <Text style={styles.text}>{action.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    gap: spacing.sm
  },
  button: {
    minHeight: 40,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.tiny
  },
  symbol: {
    color: colors.accentBrown,
    fontSize: 16,
    fontWeight: '900'
  },
  text: {
    color: colors.textMain,
    fontSize: 12,
    fontWeight: '800'
  }
});
