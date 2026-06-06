import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuthStore } from '../stores/authStore';

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
      <Text style={styles.title}>방 만들 준비</Text>
      <Text style={styles.subtitle}>회원가입할 때 사용할 닉네임을 함께 입력해 주세요.</Text>
      <TextInput
        style={styles.input}
        value={nickname}
        onChangeText={setNickname}
        placeholder="닉네임"
        placeholderTextColor="#9c8a90"
      />
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="이메일"
        placeholderTextColor="#9c8a90"
      />
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="비밀번호"
        placeholderTextColor="#9c8a90"
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable style={styles.primary} disabled={loading} onPress={() => signup(email, password, nickname)}>
        <Text style={styles.primaryText}>{loading ? '가입 중' : '회원가입'}</Text>
      </Pressable>
      <Pressable style={styles.link} onPress={onLogin}>
        <Text style={styles.linkText}>이미 계정이 있어요</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff7f8'
  },
  title: {
    color: '#3b2d32',
    fontSize: 30,
    fontWeight: '900'
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 28,
    color: '#8d6270',
    fontSize: 15,
    lineHeight: 22
  },
  input: {
    height: 50,
    marginBottom: 12,
    borderRadius: 8,
    paddingHorizontal: 14,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#ead5db',
    color: '#3b2d32'
  },
  primary: {
    height: 50,
    marginTop: 8,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#51313a'
  },
  primaryText: {
    color: '#ffffff',
    fontWeight: '900'
  },
  link: {
    marginTop: 16,
    alignItems: 'center'
  },
  linkText: {
    color: '#8d6270',
    fontWeight: '800'
  },
  error: {
    color: '#b4495f',
    marginBottom: 8
  }
});
