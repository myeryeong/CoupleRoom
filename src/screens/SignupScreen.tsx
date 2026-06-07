import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuthStore } from '../stores/authStore';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { shadows } from '../theme/shadows';

type Props = {
  onLogin: () => void;
};

export default function SignupScreen({ onLogin }: Props) {
  const { signup, error, loading } = useAuthStore();
  const [nickname, setNickname] = useState('나');
  const [email, setEmail] = useState('mock@couple.room');
  const [password, setPassword] = useState('password123');

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.eyebrow}>처음 만드는 우리 방</Text>
        <Text style={styles.title}>회원가입</Text>
        <Text style={styles.subtitle}>캐릭터 위에 보일 닉네임을 함께 입력해 주세요.</Text>
        <TextInput style={styles.input} value={nickname} onChangeText={setNickname} placeholder="닉네임" placeholderTextColor={colors.textSub} />
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
        <Pressable style={styles.primary} disabled={loading} onPress={() => signup(email, password, nickname)}>
          <Text style={styles.primaryText}>{loading ? '가입 중' : '회원가입'}</Text>
        </Pressable>
        <Pressable style={styles.link} onPress={onLogin}>
          <Text style={styles.linkText}>이미 계정이 있어요</Text>
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
