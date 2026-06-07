import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { shadows } from '../theme/shadows';

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.mark}>
        <Text style={styles.markText}>♡</Text>
      </View>
      <Text style={styles.title}>CoupleRoom</Text>
      <Text style={styles.subtitle}>우리 둘만의 작은 방을 준비하고 있어요</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: spacing.xl
  },
  mark: {
    width: 92,
    height: 92,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.border,
    ...shadows.soft
  },
  markText: {
    color: colors.accentPink,
    fontSize: 42,
    fontWeight: '900'
  },
  title: {
    marginTop: spacing.lg,
    color: colors.textMain,
    fontSize: 30,
    fontWeight: '900'
  },
  subtitle: {
    marginTop: spacing.sm,
    color: colors.textSub,
    fontSize: 15,
    textAlign: 'center'
  }
});
