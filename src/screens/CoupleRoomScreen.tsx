import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Dimensions, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Character from '../components/Character';
import ChatPanel from '../components/ChatPanel';
import DailyQuestionCard from '../components/DailyQuestionCard';
import DirectionControls from '../components/DirectionControls';
import InteractionButton from '../components/InteractionButton';
import { useAuthStore } from '../stores/authStore';
import { useRoomStore } from '../stores/roomStore';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { shadows } from '../theme/shadows';
import { FurnitureType, InteractionType, RoomFurniture } from '../types/models';
import { clampPoint, distance } from '../utils/distance';
import { throttle } from '../utils/throttle';

type Props = {
  onUnlinked: () => void;
};

const roomWidth = Dimensions.get('window').width - 32;
const roomHeight = 350;

const interactionCopy: Record<InteractionType, string> = {
  hug: '안아주었어요',
  kiss: '뽀뽀했어요',
  pat: '쓰다듬어주었어요'
};

const furnitureCopy: Record<FurnitureType, string> = {
  sofa: '소파',
  table: '테이블',
  plant: '화분',
  lamp: '스탠드',
  rug: '러그'
};

function FurnitureItem({ item, onPress }: { item: RoomFurniture; onPress: () => void }) {
  const common = [styles.furniture, { left: item.x, top: item.y }];

  if (item.type === 'rug') {
    return <Pressable style={[common, styles.rug]} onPress={onPress} />;
  }
  if (item.type === 'table') {
    return (
      <Pressable style={[common, styles.table]} onPress={onPress}>
        <Text style={styles.furnitureLabel}>tea</Text>
      </Pressable>
    );
  }
  if (item.type === 'plant') {
    return (
      <Pressable style={[common, styles.plant]} onPress={onPress}>
        <View style={styles.leaf} />
      </Pressable>
    );
  }
  if (item.type === 'lamp') {
    return (
      <Pressable style={[common, styles.lamp]} onPress={onPress}>
        <View style={styles.lampShade} />
        <View style={styles.lampPole} />
      </Pressable>
    );
  }
  return <Pressable style={[common, styles.sofa]} onPress={onPress} />;
}

export default function CoupleRoomScreen({ onUnlinked }: Props) {
  const { profile, logout, updateNickname } = useAuthStore();
  const {
    partnerProfile,
    myPresence,
    partnerPresence,
    messages,
    interactions,
    furniture,
    question,
    answers,
    loadRoom,
    updatePosition,
    sendMessage,
    sendInteraction,
    addFurniture,
    moveFurniture,
    saveAnswer,
    leaveRealtime
  } = useRoomStore();
  const [toast, setToast] = useState('');
  const [editingNickname, setEditingNickname] = useState(false);
  const [nicknameDraft, setNicknameDraft] = useState(profile?.nickname ?? '');
  const effectScale = useRef(new Animated.Value(0)).current;

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
      setNicknameDraft(profile.nickname);
      loadRoom(profile);
    }

    return () => leaveRealtime();
  }, [profile, loadRoom, leaveRealtime]);

  useEffect(() => {
    const last = interactions[interactions.length - 1];
    if (!last || !profile || last.sender_id === profile.id) {
      return;
    }
    setToast(`${partnerProfile?.nickname ?? '상대'}님이 ${interactionCopy[last.type]}.`);
    Animated.sequence([
      Animated.spring(effectScale, { toValue: 1, useNativeDriver: true }),
      Animated.timing(effectScale, { toValue: 0, duration: 900, useNativeDriver: true })
    ]).start();
    const timer = setTimeout(() => setToast(''), 1800);
    return () => clearTimeout(timer);
  }, [effectScale, interactions, partnerProfile?.nickname, profile]);

  if (!profile) {
    return null;
  }

  const me = myPresence ?? {
    id: 'local',
    couple_id: profile.couple_id ?? '',
    user_id: profile.id,
    nickname: profile.nickname,
    x: 110,
    y: 230,
    is_online: true,
    last_seen: new Date().toISOString()
  };
  const partner = partnerPresence;
  const partnerPoint = partner ? { x: partner.x, y: partner.y } : { x: 245, y: 160 };
  const partnerNickname = partner?.nickname ?? partnerProfile?.nickname ?? '상대';
  const canInteract = Boolean(partner && partner.is_online && distance({ x: me.x, y: me.y }, partnerPoint) < 95);

  const move = (dx: number, dy: number) => {
    const next = clampPoint({ x: me.x + dx, y: me.y + dy }, roomWidth, roomHeight, 34);
    throttledPosition(next.x, next.y);
  };

  const saveNickname = async () => {
    const nextNickname = nicknameDraft.trim() || '나';
    await updateNickname(nextNickname);
    setEditingNickname(false);
    await updatePosition({ ...profile, nickname: nextNickname }, { x: me.x, y: me.y });
  };

  const handleInteraction = (type: InteractionType) => {
    if (!partner) {
      return;
    }
    sendInteraction(profile, partner.user_id, type);
    setToast(`${partnerNickname}님에게 ${interactionCopy[type]}.`);
    Animated.sequence([
      Animated.spring(effectScale, { toValue: 1, useNativeDriver: true }),
      Animated.timing(effectScale, { toValue: 0, duration: 850, useNativeDriver: true })
    ]).start();
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>우리 둘만의 작은 방</Text>
          <Text style={styles.roomTitle}>Couple Room</Text>
          <Text style={styles.status}>{partner?.is_online ? `${partnerNickname} 온라인` : `${partnerNickname} 오프라인`}</Text>
        </View>
        <Pressable
          style={styles.exit}
          onPress={async () => {
            leaveRealtime();
            await logout();
            onUnlinked();
          }}
        >
          <Text style={styles.exitText}>나가기</Text>
        </Pressable>
      </View>

      <View style={styles.nicknamePanel}>
        {editingNickname ? (
          <>
            <TextInput
              style={styles.nicknameInput}
              value={nicknameDraft}
              onChangeText={setNicknameDraft}
              placeholder="닉네임"
              placeholderTextColor={colors.textSub}
            />
            <Pressable style={styles.smallButton} onPress={saveNickname}>
              <Text style={styles.smallButtonText}>저장</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Text style={styles.nicknameText}>내 닉네임: {profile.nickname}</Text>
            <Pressable style={styles.smallButton} onPress={() => setEditingNickname(true)}>
              <Text style={styles.smallButtonText}>수정</Text>
            </Pressable>
          </>
        )}
      </View>

      <View style={[styles.room, { width: roomWidth, height: roomHeight }]}>
        <View style={styles.wall}>
          <View style={styles.window}>
            <View style={styles.windowLine} />
            <View style={[styles.windowLine, styles.windowLineVertical]} />
          </View>
          <View style={styles.shelf}>
            <View style={styles.tinyFrame} />
            <View style={styles.tinyBook} />
          </View>
        </View>
        <View style={styles.floor} />
        {furniture.map((item) => (
          <FurnitureItem key={item.id} item={item} onPress={() => moveFurniture(profile, item.id)} />
        ))}
        <Character nickname={profile.nickname} position={{ x: me.x, y: me.y }} variant="me" online />
        {partner ? <Character nickname={partnerNickname} position={partnerPoint} variant="partner" online={partner.is_online} /> : null}
        <Animated.Text style={[styles.effect, { transform: [{ scale: effectScale }] }]}>♡</Animated.Text>
      </View>

      <View style={styles.decorationPanel}>
        <Text style={styles.panelTitle}>방 꾸미기</Text>
        <View style={styles.furnitureRow}>
          {(Object.keys(furnitureCopy) as FurnitureType[]).map((type) => (
            <Pressable key={type} style={styles.furnitureButton} onPress={() => addFurniture(profile, type)}>
              <Text style={styles.furnitureButtonText}>{furnitureCopy[type]}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.hint}>가구를 누르면 위치가 조금씩 움직여요.</Text>
      </View>

      <View style={styles.controls}>
        <DirectionControls onMove={move} />
        <View style={styles.side}>
          <InteractionButton visible={canInteract} onPress={handleInteraction} />
          {!canInteract ? <Text style={styles.hint}>가까이 다가가면 상호작용할 수 있어요.</Text> : null}
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
    padding: spacing.lg,
    gap: spacing.md,
    backgroundColor: colors.background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  eyebrow: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: '900'
  },
  roomTitle: {
    color: colors.textMain,
    fontSize: 26,
    fontWeight: '900'
  },
  status: {
    marginTop: 2,
    color: colors.textSub,
    fontSize: 13,
    fontWeight: '700'
  },
  exit: {
    borderRadius: 18,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border
  },
  exitText: {
    color: colors.accentBrown,
    fontWeight: '900'
  },
  nicknamePanel: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: 18,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.tiny
  },
  nicknameText: {
    flex: 1,
    color: colors.textMain,
    fontWeight: '900'
  },
  nicknameInput: {
    flex: 1,
    height: 38,
    color: colors.textMain
  },
  smallButton: {
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    backgroundColor: colors.primaryDark
  },
  smallButtonText: {
    color: colors.white,
    fontWeight: '900'
  },
  room: {
    overflow: 'hidden',
    alignSelf: 'center',
    borderRadius: 24,
    backgroundColor: colors.roomWall,
    borderWidth: 2,
    borderColor: colors.border,
    ...shadows.soft
  },
  wall: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 170,
    backgroundColor: colors.roomWall
  },
  floor: {
    position: 'absolute',
    left: -20,
    right: -20,
    bottom: -24,
    height: 210,
    transform: [{ skewY: '-8deg' }],
    backgroundColor: colors.roomFloor,
    borderTopWidth: 2,
    borderTopColor: '#D8B98F'
  },
  window: {
    position: 'absolute',
    right: 32,
    top: 26,
    width: 78,
    height: 58,
    borderRadius: 16,
    backgroundColor: '#FFFDF7',
    borderWidth: 2,
    borderColor: colors.border
  },
  windowLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 28,
    height: 2,
    backgroundColor: colors.border
  },
  windowLineVertical: {
    top: 0,
    bottom: 0,
    left: 38,
    width: 2,
    height: '100%'
  },
  shelf: {
    position: 'absolute',
    left: 28,
    top: 42,
    width: 92,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primaryDark
  },
  tinyFrame: {
    position: 'absolute',
    left: 10,
    bottom: 12,
    width: 22,
    height: 26,
    borderRadius: 5,
    backgroundColor: colors.accentPink
  },
  tinyBook: {
    position: 'absolute',
    left: 42,
    bottom: 12,
    width: 32,
    height: 24,
    borderRadius: 5,
    backgroundColor: colors.primary
  },
  furniture: {
    position: 'absolute'
  },
  rug: {
    width: 134,
    height: 78,
    borderRadius: 44,
    backgroundColor: '#F2CFC4',
    borderWidth: 2,
    borderColor: '#E7B9AB'
  },
  table: {
    width: 84,
    height: 48,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.primaryDark
  },
  furnitureLabel: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '900'
  },
  plant: {
    width: 44,
    height: 56,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    backgroundColor: colors.accentBrown
  },
  leaf: {
    position: 'absolute',
    top: -20,
    left: 5,
    width: 34,
    height: 34,
    borderRadius: 20,
    backgroundColor: '#87A878'
  },
  lamp: {
    width: 42,
    height: 72,
    alignItems: 'center'
  },
  lampShade: {
    width: 38,
    height: 24,
    borderRadius: 14,
    backgroundColor: '#F6DFAF'
  },
  lampPole: {
    width: 5,
    height: 42,
    backgroundColor: colors.primaryDark
  },
  sofa: {
    width: 108,
    height: 54,
    borderRadius: 18,
    backgroundColor: '#D7A999',
    borderWidth: 2,
    borderColor: '#BD8D7E'
  },
  effect: {
    position: 'absolute',
    left: roomWidth / 2 - 18,
    top: 110,
    color: colors.danger,
    fontSize: 48,
    fontWeight: '900'
  },
  decorationPanel: {
    borderRadius: 18,
    padding: spacing.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.tiny
  },
  panelTitle: {
    color: colors.textMain,
    fontWeight: '900',
    marginBottom: spacing.sm
  },
  furnitureRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm
  },
  furnitureButton: {
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.roomWall,
    borderWidth: 1,
    borderColor: colors.border
  },
  furnitureButtonText: {
    color: colors.accentBrown,
    fontWeight: '900',
    fontSize: 12
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  side: {
    flex: 1,
    alignItems: 'center',
    paddingLeft: spacing.md
  },
  hint: {
    marginTop: spacing.xs,
    color: colors.textSub,
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 17
  },
  toast: {
    marginTop: spacing.sm,
    color: colors.accentBrown,
    textAlign: 'center',
    fontWeight: '900'
  }
});
