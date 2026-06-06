import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuthStore } from '../stores/authStore';

type Props = {
  onSignup: () => void;
};

export default function LoginScreen({ onSignup }: Props) {
  const { login, error, loading } = useAuthStore();
  const [email, setEmail] = useState('mock@couple.room');
  const [password, setPassword] = useState('password123');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>다시 만나는 방</Text>
      <Text style={styles.subtitle}>이메일로 로그인하고 둘만의 공간에 들어가요.</Text>
      <TextInput style={styles.input} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable style={styles.primary} disabled={loading} onPress={() => login(email, password)}>
        <Text style={styles.primaryText}>{loading ? '확인 중' : '로그인'}</Text>
      </Pressable>
      <Pressable style={styles.link} onPress={onSignup}>
        <Text style={styles.linkText}>처음이라면 회원가입</Text>
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
