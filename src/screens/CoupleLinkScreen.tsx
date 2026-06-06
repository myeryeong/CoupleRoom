import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuthStore } from '../stores/authStore';
import { useRoomStore } from '../stores/roomStore';

type Props = {
  onLinked: () => void;
};

export default function CoupleLinkScreen({ onLinked }: Props) {
  const { profile, setProfile } = useAuthStore();
  const { createInvite, joinInvite, couple, loading } = useRoomStore();
  const [inviteCode, setInviteCode] = useState('');
  const [notice, setNotice] = useState('');

  const applyCouple = (coupleId: string) => {
    if (profile) {
      setProfile({ ...profile, couple_id: coupleId });
    }
    onLinked();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>커플 연결</Text>
      <Text style={styles.subtitle}>초대 코드를 만들거나 받은 코드를 입력하면 같은 방으로 연결돼요.</Text>
      {couple?.invite_code ? (
        <View style={styles.inviteBox}>
          <Text style={styles.inviteLabel}>내 초대 코드</Text>
          <Text style={styles.inviteCode}>{couple.invite_code}</Text>
          <Text style={styles.notice}>상대가 입력하면 방이 열려요.</Text>
        </View>
      ) : null}
      <Pressable
        style={styles.primary}
        disabled={!profile || loading}
        onPress={async () => {
          if (!profile) {
            return;
          }
          const nextCouple = await createInvite(profile.id);
          applyCouple(nextCouple.id);
        }}
      >
        <Text style={styles.primaryText}>초대 코드 만들기</Text>
      </Pressable>
      <View style={styles.divider} />
      <TextInput
        style={styles.input}
        value={inviteCode}
        onChangeText={(value) => setInviteCode(value.toUpperCase())}
        placeholder="초대 코드 입력"
        placeholderTextColor="#9c8a90"
        autoCapitalize="characters"
      />
      <Pressable
        style={styles.secondary}
        disabled={!profile || loading}
        onPress={async () => {
          if (!profile || !inviteCode.trim()) {
            setNotice('초대 코드를 입력해 주세요.');
            return;
          }
          const nextCouple = await joinInvite(inviteCode.trim(), profile.id);
          applyCouple(nextCouple.id);
        }}
      >
        <Text style={styles.secondaryText}>코드로 입장</Text>
      </Pressable>
      {notice ? <Text style={styles.notice}>{notice}</Text> : null}
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
    marginBottom: 22,
    color: '#8d6270',
    fontSize: 15,
    lineHeight: 22
  },
  inviteBox: {
    marginBottom: 16,
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#ead5db'
  },
  inviteLabel: {
    color: '#8d6270',
    fontSize: 12,
    fontWeight: '800'
  },
  inviteCode: {
    marginTop: 6,
    color: '#51313a',
    fontSize: 28,
    fontWeight: '900'
  },
  input: {
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 14,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#ead5db',
    color: '#3b2d32'
  },
  primary: {
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#51313a'
  },
  primaryText: {
    color: '#ffffff',
    fontWeight: '900'
  },
  secondary: {
    height: 50,
    marginTop: 10,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8fcfd0'
  },
  secondaryText: {
    color: '#263b3c',
    fontWeight: '900'
  },
  divider: {
    height: 1,
    marginVertical: 22,
    backgroundColor: '#ead5db'
  },
  notice: {
    marginTop: 10,
    color: '#8d6270'
  }
});
