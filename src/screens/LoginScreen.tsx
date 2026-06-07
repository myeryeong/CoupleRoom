import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuthStore } from '../stores/authStore';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { shadows } from '../theme/shadows';

type Props = {
  onSignup: () => void;
};

export default function LoginScreen({ onSignup }: Props) {
  const { login, error, loading } = useAuthStore();
  const [email, setEmail] = useState('mock@couple.room');
  const [password, setPassword] = useState('password123');

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.eyebrow}>우리 방으로 돌아가기</Text>
        <Text style={styles.title}>다시 만나는 방</Text>
        <Text style={styles.subtitle}>이메일로 로그인하고 둘만의 미니룸에 들어가요.</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="이메일"
          placeholderTextColor={colors.textSub}
        />
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="비밀번호"
          placeholderTextColor={colors.textSub}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Pressable style={styles.primary} disabled={loading} onPress={() => login(email, password)}>
          <Text style={styles.primaryText}>{loading ? '확인 중' : '로그인'}</Text>
        </Pressable>
        <Pressable style={styles.link} onPress={onSignup}>
          <Text style={styles.linkText}>처음이라면 회원가입</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background
  },
  card: {
    borderRadius: 24,
    padding: spacing.xl,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.soft
  },
  eyebrow: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: '900'
  },
  title: {
    marginTop: spacing.xs,
    color: colors.textMain,
    fontSize: 30,
    fontWeight: '900'
  },
  subtitle: {
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
    color: colors.textSub,
    fontSize: 15,
    lineHeight: 22
  },
  input: {
    height: 50,
    marginBottom: spacing.md,
    borderRadius: 16,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.textMain
  },
  primary: {
    height: 50,
    marginTop: spacing.sm,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryDark
  },
  primaryText: {
    color: colors.white,
    fontWeight: '900'
  },
  link: {
    marginTop: spacing.lg,
    alignItems: 'center'
  },
  linkText: {
    color: colors.accentBrown,
    fontWeight: '900'
  },
  error: {
    color: colors.danger,
    marginBottom: spacing.sm
  }
});
