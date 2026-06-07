import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuthStore } from '../stores/authStore';
import { useRoomStore } from '../stores/roomStore';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { shadows } from '../theme/shadows';

type Props = {
  onLinked: () => void;
};

export default function CoupleLinkScreen({ onLinked }: Props) {
  const { profile, setProfile } = useAuthStore();
  const { createInvite, joinInvite, couple, loading, error } = useRoomStore();
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
      <View style={styles.card}>
        <Text style={styles.eyebrow}>둘만의 방 열기</Text>
        <Text style={styles.title}>커플 연결</Text>
        <Text style={styles.subtitle}>초대 코드를 만들거나 받은 코드를 입력하면 같은 Couple Room으로 연결돼요.</Text>

        {couple?.invite_code ? (
          <View style={styles.inviteBox}>
            <Text style={styles.inviteLabel}>내 초대 코드</Text>
            <Text style={styles.inviteCode}>{couple.invite_code}</Text>
            <Text style={styles.notice}>상대가 이 코드를 입력하면 같은 방에 들어올 수 있어요.</Text>
          </View>
        ) : null}

        <Pressable
          style={styles.primary}
          disabled={!profile || loading}
          onPress={async () => {
            if (!profile) {
              return;
            }
            try {
              const nextCouple = await createInvite(profile);
              applyCouple(nextCouple.id);
            } catch (nextError) {
              setNotice(nextError instanceof Error ? nextError.message : '초대 코드 생성에 실패했어요.');
            }
          }}
        >
          <Text style={styles.primaryText}>{loading ? '처리 중' : '초대 코드 만들기'}</Text>
        </Pressable>

        <View style={styles.divider} />

        <TextInput
          style={styles.input}
          value={inviteCode}
          onChangeText={(value) => setInviteCode(value.toUpperCase())}
          placeholder="초대 코드 입력"
          placeholderTextColor={colors.textSub}
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
            try {
              const nextCouple = await joinInvite(inviteCode, profile);
              applyCouple(nextCouple.id);
            } catch (nextError) {
              setNotice(nextError instanceof Error ? nextError.message : '커플 연결에 실패했어요.');
            }
          }}
        >
          <Text style={styles.secondaryText}>코드로 입장</Text>
        </Pressable>

        {notice || error ? <Text style={styles.notice}>{notice || error}</Text> : null}
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
    marginBottom: spacing.lg,
    color: colors.textSub,
    fontSize: 15,
    lineHeight: 22
  },
  inviteBox: {
    marginBottom: spacing.lg,
    borderRadius: 20,
    padding: spacing.lg,
    backgroundColor: colors.roomWall,
    borderWidth: 1,
    borderColor: colors.border
  },
  inviteLabel: {
    color: colors.textSub,
    fontSize: 12,
    fontWeight: '900'
  },
  inviteCode: {
    marginTop: spacing.xs,
    color: colors.primaryDark,
    fontSize: 30,
    fontWeight: '900'
  },
  input: {
    height: 50,
    borderRadius: 16,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.textMain
  },
  primary: {
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryDark
  },
  primaryText: {
    color: colors.white,
    fontWeight: '900'
  },
  secondary: {
    height: 50,
    marginTop: spacing.md,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary
  },
  secondaryText: {
    color: colors.textMain,
    fontWeight: '900'
  },
  divider: {
    height: 1,
    marginVertical: spacing.xl,
    backgroundColor: colors.border
  },
  notice: {
    marginTop: spacing.md,
    color: colors.textSub,
    lineHeight: 20
  }
});
