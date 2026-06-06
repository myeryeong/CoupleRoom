import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import Character from '../components/Character';
import ChatPanel from '../components/ChatPanel';
import DailyQuestionCard from '../components/DailyQuestionCard';
import DirectionControls from '../components/DirectionControls';
import InteractionButton from '../components/InteractionButton';
import { useAuthStore } from '../stores/authStore';
import { useRoomStore } from '../stores/roomStore';
import { clampPoint, distance } from '../utils/distance';
import { throttle } from '../utils/throttle';

type Props = {
  onUnlinked: () => void;
};

const roomWidth = Dimensions.get('window').width - 32;
const roomHeight = 320;

export default function CoupleRoomScreen({ onUnlinked }: Props) {
  const { profile, logout } = useAuthStore();
  const {
    myPresence,
    partnerPresence,
    messages,
    interactions,
    question,
    answers,
    loadRoom,
    updatePosition,
    sendMessage,
    sendHug,
    saveAnswer,
    leaveRealtime
  } = useRoomStore();
  const [toast, setToast] = useState('');
  const heartScale = useRef(new Animated.Value(0)).current;

  const throttledPosition = useMemo(
    () =>
      throttle((x: number, y: number) => {
        if (profile) {
          updatePosition(profile, { x, y });
        }
      }, 120),
    [profile, updatePosition]
  );

  useEffect(() => {
    if (profile) {
      loadRoom(profile);
    }

    return () => leaveRealtime();
  }, [profile, loadRoom, leaveRealtime]);

  useEffect(() => {
    const last = interactions[interactions.length - 1];
    if (!last || !profile || last.sender_id === profile.id) {
      return;
    }
    setToast('상대방이 당신을 안아주었어요.');
    Animated.sequence([
      Animated.spring(heartScale, { toValue: 1, useNativeDriver: true }),
      Animated.timing(heartScale, { toValue: 0, duration: 900, useNativeDriver: true })
    ]).start();
    const timer = setTimeout(() => setToast(''), 1800);
    return () => clearTimeout(timer);
  }, [heartScale, interactions, profile]);

  if (!profile) {
    return null;
  }

  const me = myPresence ?? {
    id: 'local',
    couple_id: profile.couple_id ?? '',
    user_id: profile.id,
    x: 110,
    y: 210,
    is_online: true,
    last_seen: new Date().toISOString()
  };
  const partner = partnerPresence;
  const partnerPoint = partner ? { x: partner.x, y: partner.y } : { x: 245, y: 150 };
  const canHug = Boolean(partner && distance({ x: me.x, y: me.y }, partnerPoint) < 90);

  const move = (dx: number, dy: number) => {
    const next = clampPoint({ x: me.x + dx, y: me.y + dy }, roomWidth, roomHeight, 30);
    throttledPosition(next.x, next.y);
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View>
          <Text style={styles.roomTitle}>Couple Room</Text>
          <Text style={styles.status}>{partner?.is_online ? '상대 온라인' : '상대 오프라인'}</Text>
        </View>
        <Pressable
          style={styles.exit}
          onPress={async () => {
            await logout();
            onUnlinked();
          }}
        >
          <Text style={styles.exitText}>나가기</Text>
        </Pressable>
      </View>

      <View style={[styles.room, { width: roomWidth, height: roomHeight }]}>
        <View style={styles.rug} />
        <View style={styles.table}>
          <Text style={styles.tableText}>둘만의 탁자</Text>
        </View>
        <View style={styles.plant} />
        <Character nickname={profile.nickname} position={{ x: me.x, y: me.y }} variant="me" online />
        <Character nickname="상대" position={partnerPoint} variant="partner" online={partner?.is_online ?? false} />
        <Animated.Text style={[styles.heart, { transform: [{ scale: heartScale }] }]}>♡</Animated.Text>
      </View>

      <View style={styles.controls}>
        <DirectionControls onMove={move} />
        <View style={styles.side}>
          <InteractionButton
            visible={canHug}
            onPress={() => {
              if (partner) {
                sendHug(profile, partner.user_id);
                setToast('따뜻한 안아주기를 보냈어요.');
              }
            }}
          />
          {toast ? <Text style={styles.toast}>{toast}</Text> : null}
        </View>
      </View>

      <DailyQuestionCard question={question} answers={answers} myUserId={profile.id} onSubmit={(answer) => saveAnswer(profile, answer)} />
      <ChatPanel messages={messages} myUserId={profile.id} onSend={(content) => sendMessage(profile, content)} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 16,
    gap: 12,
    backgroundColor: '#fff7f8'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  roomTitle: {
    color: '#3b2d32',
    fontSize: 24,
    fontWeight: '900'
  },
  status: {
    marginTop: 2,
    color: '#8d6270',
    fontSize: 13,
    fontWeight: '700'
  },
  exit: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#ead5db'
  },
  exitText: {
    color: '#51313a',
    fontWeight: '800'
  },
  room: {
    overflow: 'hidden',
    alignSelf: 'center',
    borderRadius: 8,
    backgroundColor: '#f4d6dc',
    borderWidth: 1,
    borderColor: '#e7bfca'
  },
  rug: {
    position: 'absolute',
    left: 48,
    right: 48,
    bottom: 32,
    height: 86,
    borderRadius: 43,
    backgroundColor: '#f8eef2'
  },
  table: {
    position: 'absolute',
    left: 24,
    top: 28,
    width: 112,
    height: 62,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#b98290'
  },
  tableText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800'
  },
  plant: {
    position: 'absolute',
    right: 28,
    top: 26,
    width: 48,
    height: 74,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    backgroundColor: '#74a683'
  },
  heart: {
    position: 'absolute',
    left: roomWidth / 2 - 18,
    top: 105,
    color: '#b4495f',
    fontSize: 46,
    fontWeight: '900'
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  side: {
    flex: 1,
    alignItems: 'center',
    paddingLeft: 12
  },
  toast: {
    marginTop: 8,
    color: '#8d6270',
    textAlign: 'center',
    fontWeight: '700'
  }
});
