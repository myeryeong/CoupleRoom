import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RealtimeChannel } from '@supabase/supabase-js';
import { createInviteCode, isMockMode, supabase } from '../lib/supabase';
import { subscribeToRoom, trackRoomPresence, unsubscribe } from '../lib/realtime';
import {
  Couple,
  DailyAnswer,
  DailyQuestion,
  FurnitureType,
  Interaction,
  InteractionType,
  Message,
  Point,
  Profile,
  RealtimePresenceState,
  RoomFurniture,
  RoomPresence
} from '../types/models';

type RoomState = {
  couple: Couple | null;
  partnerProfile: Profile | null;
  myPresence: RoomPresence | null;
  partnerPresence: RoomPresence | null;
  messages: Message[];
  interactions: Interaction[];
  furniture: RoomFurniture[];
  question: DailyQuestion | null;
  answers: DailyAnswer[];
  loading: boolean;
  error: string | null;
  channel: RealtimeChannel | null;
  createInvite: (profile: Profile) => Promise<Couple>;
  joinInvite: (inviteCode: string, profile: Profile) => Promise<Couple>;
  loadRoom: (profile: Profile) => Promise<void>;
  updatePosition: (profile: Profile, point: Point) => Promise<void>;
  sendMessage: (profile: Profile, content: string) => Promise<void>;
  sendInteraction: (profile: Profile, receiverId: string, type: InteractionType) => Promise<void>;
  addFurniture: (profile: Profile, type: FurnitureType) => Promise<void>;
  moveFurniture: (profile: Profile, furnitureId: string) => Promise<void>;
  saveAnswer: (profile: Profile, answer: string) => Promise<void>;
  leaveRealtime: () => void;
};

const today = () => new Date().toISOString().slice(0, 10);

const defaultFurniture: Omit<RoomFurniture, 'id' | 'couple_id'>[] = [
  { type: 'rug', x: 135, y: 235 },
  { type: 'table', x: 52, y: 92 },
  { type: 'plant', x: 260, y: 76 },
  { type: 'lamp', x: 28, y: 52 }
];

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function makeUuid() {
  const bytes = Array.from({ length: 16 }, () => Math.floor(Math.random() * 256));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.map((byte) => byte.toString(16).padStart(2, '0'));
  return `${hex.slice(0, 4).join('')}-${hex.slice(4, 6).join('')}-${hex.slice(6, 8).join('')}-${hex
    .slice(8, 10)
    .join('')}-${hex.slice(10, 16).join('')}`;
}

function toRoomPresence(profile: Profile, point: Point, isOnline = true): RoomPresence {
  return {
    id: makeId('presence'),
    couple_id: profile.couple_id ?? '',
    user_id: profile.id,
    nickname: profile.nickname,
    x: point.x,
    y: point.y,
    is_online: isOnline,
    last_seen: new Date().toISOString()
  };
}

function toRealtimePresence(profile: Profile, point: Point): RealtimePresenceState {
  return {
    user_id: profile.id,
    nickname: profile.nickname,
    x: point.x,
    y: point.y,
    online_at: new Date().toISOString()
  };
}

function decorateDefaults(coupleId: string): RoomFurniture[] {
  return defaultFurniture.map((item) => ({
    ...item,
    id: makeUuid(),
    couple_id: coupleId
  }));
}

async function readMockCouple() {
  const stored = await AsyncStorage.getItem('mock-couple');
  return stored ? (JSON.parse(stored) as Couple) : null;
}

async function saveMockCouple(couple: Couple) {
  await AsyncStorage.setItem('mock-couple', JSON.stringify(couple));
}

async function saveMockProfile(profile: Profile) {
  await AsyncStorage.setItem('mock-profile', JSON.stringify(profile));
}

async function readMockFurniture(coupleId: string) {
  const stored = await AsyncStorage.getItem(`mock-furniture:${coupleId}`);
  return stored ? (JSON.parse(stored) as RoomFurniture[]) : decorateDefaults(coupleId);
}

async function saveMockFurniture(coupleId: string, furniture: RoomFurniture[]) {
  await AsyncStorage.setItem(`mock-furniture:${coupleId}`, JSON.stringify(furniture));
}

function findPartnerId(couple: Couple | null, currentUserId: string) {
  if (!couple) {
    return null;
  }
  return couple.user1_id === currentUserId ? couple.user2_id : couple.user1_id;
}

export const useRoomStore = create<RoomState>((set, get) => ({
  couple: null,
  partnerProfile: null,
  myPresence: null,
  partnerPresence: null,
  messages: [],
  interactions: [],
  furniture: [],
  question: null,
  answers: [],
  loading: false,
  error: null,
  channel: null,

  createInvite: async (profile) => {
    set({ loading: true, error: null });
    try {
      const invite_code = createInviteCode();
      if (isMockMode) {
        const couple: Couple = { id: makeId('couple'), invite_code, user1_id: profile.id, user2_id: null };
        await saveMockCouple(couple);
        await saveMockProfile({ ...profile, couple_id: couple.id });
        await saveMockFurniture(couple.id, decorateDefaults(couple.id));
        set({ couple });
        return couple;
      }

      const { data, error } = await supabase
        .from('couples')
        .insert({ invite_code, user1_id: profile.id, user2_id: null })
        .select('*')
        .single();
      if (error) {
        throw error;
      }

      const { error: profileError } = await supabase.from('profiles').update({ couple_id: data.id }).eq('id', profile.id);
      if (profileError) {
        throw profileError;
      }

      set({ couple: data });
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : '초대 코드 생성에 실패했어요.';
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ loading: false });
    }
  },

  joinInvite: async (inviteCode, profile) => {
    set({ loading: true, error: null });
    try {
      const normalizedCode = inviteCode.trim().toUpperCase();
      if (isMockMode) {
        const existing =
          (await readMockCouple()) ??
          ({ id: makeId('couple'), invite_code: normalizedCode, user1_id: 'partner-user', user2_id: null } satisfies Couple);

        if (existing.user1_id === profile.id) {
          throw new Error('본인의 초대 코드는 사용할 수 없습니다.');
        }
        if (existing.user2_id && existing.user2_id !== profile.id) {
          throw new Error('이미 연결된 초대 코드입니다.');
        }

        const couple = { ...existing, user2_id: profile.id };
        await saveMockCouple(couple);
        await saveMockProfile({ ...profile, couple_id: couple.id });
        set({ couple });
        return couple;
      }

      const { data: couple, error } = await supabase.from('couples').select('*').eq('invite_code', normalizedCode).maybeSingle();
      if (error) {
        throw error;
      }
      if (!couple) {
        throw new Error('초대 코드를 찾을 수 없습니다.');
      }
      if (couple.user1_id === profile.id) {
        throw new Error('본인의 초대 코드는 사용할 수 없습니다.');
      }
      if (couple.user2_id && couple.user2_id !== profile.id) {
        throw new Error('이미 연결된 초대 코드입니다.');
      }

      const { data, error: updateError } = await supabase
        .from('couples')
        .update({ user2_id: profile.id })
        .eq('id', couple.id)
        .is('user2_id', null)
        .select('*')
        .single();
      if (updateError) {
        throw updateError;
      }

      const { error: profileError } = await supabase.from('profiles').update({ couple_id: data.id }).eq('id', profile.id);
      if (profileError) {
        throw profileError;
      }

      set({ couple: data });
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : '커플 연결에 실패했어요.';
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ loading: false });
    }
  },

  loadRoom: async (profile) => {
    if (!profile.couple_id) {
      return;
    }

    const coupleId = profile.couple_id;
    get().leaveRealtime();
    set({ loading: true, error: null, partnerProfile: null, partnerPresence: null });

    try {
      const fallbackPoint = get().myPresence ? { x: get().myPresence!.x, y: get().myPresence!.y } : { x: 110, y: 210 };
      const myPresence = toRoomPresence(profile, fallbackPoint);

      if (isMockMode) {
        const couple =
          (await readMockCouple()) ??
          ({ id: coupleId, invite_code: 'MOCK12', user1_id: profile.id, user2_id: 'partner-user' } satisfies Couple);
        const partnerProfile: Profile = {
          id: findPartnerId(couple, profile.id) ?? 'partner-user',
          nickname: '상대',
          avatar_type: 'mint',
          couple_id: couple.id
        };

        set({
          couple,
          partnerProfile,
          furniture: await readMockFurniture(couple.id),
          question: {
            id: 'mock-question',
            question: '오늘 서로에게 가장 고마웠던 순간은 언제였나요?',
            active_date: today()
          },
          myPresence: { ...myPresence, couple_id: couple.id },
          partnerPresence: {
            id: 'mock-presence-partner',
            couple_id: couple.id,
            user_id: partnerProfile.id,
            nickname: partnerProfile.nickname,
            x: 230,
            y: 160,
            is_online: true,
            last_seen: new Date().toISOString()
          }
        });
        return;
      }

      const [{ data: couple, error: coupleError }, { data: dbPresence }, { data: messages }, { data: question }, { data: answers }] =
        await Promise.all([
          supabase.from('couples').select('*').eq('id', coupleId).single(),
          supabase.from('room_presence').select('*').eq('couple_id', coupleId),
          supabase.from('messages').select('*').eq('couple_id', coupleId).order('created_at', { ascending: false }).limit(50),
          supabase.from('daily_questions').select('*').eq('active_date', today()).maybeSingle(),
          supabase.from('daily_answers').select('*').eq('couple_id', coupleId)
        ]);

      if (coupleError || !couple) {
        throw coupleError ?? new Error('커플 정보를 찾을 수 없습니다.');
      }

      const partnerId = findPartnerId(couple, profile.id);
      const { data: partnerProfile } = partnerId
        ? await supabase.from('profiles').select('*').eq('id', partnerId).maybeSingle()
        : { data: null };
      const { data: dbFurniture } = await (supabase as any).from('room_furniture').select('*').eq('couple_id', coupleId);

      const savedMine = dbPresence?.find((item) => item.user_id === profile.id);
      const savedPartner = dbPresence?.find((item) => item.user_id !== profile.id);
      const nextMine = savedMine ? { ...savedMine, nickname: profile.nickname, is_online: true } : { ...myPresence, couple_id: coupleId };

      set({
        couple,
        partnerProfile: partnerProfile ?? null,
        myPresence: nextMine,
        partnerPresence: savedPartner
          ? {
              ...savedPartner,
              nickname: partnerProfile?.nickname ?? '상대',
              is_online: false
            }
          : null,
        messages: [...(messages ?? [])].reverse(),
        furniture: (dbFurniture as RoomFurniture[] | null)?.length ? (dbFurniture as RoomFurniture[]) : decorateDefaults(coupleId),
        question: question ?? null,
        answers: answers ?? []
      });

      await get().updatePosition(profile, { x: nextMine.x, y: nextMine.y });

      const channel = subscribeToRoom(coupleId, toRealtimePresence(profile, { x: nextMine.x, y: nextMine.y }), {
        onPresence: (presences) => {
          const mine = presences.find((item) => item.user_id === profile.id);
          const partner = presences.find((item) => item.user_id !== profile.id);

          if (mine) {
            set((state) => ({
              myPresence: {
                ...(state.myPresence ?? toRoomPresence(profile, { x: mine.x, y: mine.y })),
                user_id: mine.user_id,
                nickname: mine.nickname,
                x: mine.x,
                y: mine.y,
                is_online: true,
                last_seen: mine.online_at
              }
            }));
          }

          if (partner) {
            set((state) => ({
              partnerPresence: {
                ...(state.partnerPresence ??
                  toRoomPresence({ id: partner.user_id, nickname: partner.nickname, avatar_type: 'mint', couple_id: coupleId }, partner)),
                couple_id: coupleId,
                user_id: partner.user_id,
                nickname: partner.nickname,
                x: partner.x,
                y: partner.y,
                is_online: true,
                last_seen: partner.online_at
              },
              partnerProfile: state.partnerProfile
                ? { ...state.partnerProfile, nickname: partner.nickname }
                : { id: partner.user_id, nickname: partner.nickname, avatar_type: 'mint', couple_id: coupleId }
            }));
          } else {
            set((state) => ({
              partnerPresence: state.partnerPresence ? { ...state.partnerPresence, is_online: false } : null
            }));
          }
        },
        onMessage: (message) =>
          set((state) => ({
            messages: state.messages.some((item) => item.id === message.id) ? state.messages : [...state.messages, message].slice(-50)
          })),
        onInteraction: (interaction) =>
          set((state) => ({
            interactions: state.interactions.some((item) => item.id === interaction.id)
              ? state.interactions
              : [...state.interactions, interaction].slice(-6)
          })),
        onFurniture: (nextFurniture) =>
          set((state) => ({
            furniture: state.furniture.some((item) => item.id === nextFurniture.id)
              ? state.furniture.map((item) => (item.id === nextFurniture.id ? nextFurniture : item))
              : [...state.furniture, nextFurniture]
          }))
      });
      set({ channel });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '방 정보를 불러오지 못했어요.' });
    } finally {
      set({ loading: false });
    }
  },

  updatePosition: async (profile, point) => {
    if (!profile.couple_id) {
      return;
    }

    const previous = get().myPresence;
    const presence: RoomPresence = {
      id: previous?.id ?? makeId('presence'),
      couple_id: profile.couple_id,
      user_id: profile.id,
      nickname: profile.nickname,
      x: point.x,
      y: point.y,
      is_online: true,
      last_seen: new Date().toISOString()
    };
    set({ myPresence: presence });
    await trackRoomPresence(get().channel, toRealtimePresence(profile, point));

    if (!isMockMode) {
      await supabase
        .from('room_presence')
        .upsert(
          { couple_id: presence.couple_id, user_id: presence.user_id, x: presence.x, y: presence.y, is_online: true, last_seen: presence.last_seen },
          { onConflict: 'couple_id,user_id' }
        );
    }
  },

  sendMessage: async (profile, content) => {
    if (!profile.couple_id || !content.trim()) {
      return;
    }
    const trimmed = content.trim();

    if (isMockMode) {
      const message: Message = {
        id: makeId('message'),
        couple_id: profile.couple_id,
        sender_id: profile.id,
        content: trimmed,
        created_at: new Date().toISOString()
      };
      set((state) => ({ messages: [...state.messages, message].slice(-50) }));
      return;
    }

    const { error } = await supabase.from('messages').insert({ couple_id: profile.couple_id, sender_id: profile.id, content: trimmed });
    if (error) {
      throw error;
    }
  },

  sendInteraction: async (profile, receiverId, type) => {
    if (!profile.couple_id) {
      return;
    }
    const interaction: Interaction = {
      id: makeId('interaction'),
      couple_id: profile.couple_id,
      sender_id: profile.id,
      receiver_id: receiverId,
      type,
      created_at: new Date().toISOString()
    };
    set((state) => ({ interactions: [...state.interactions, interaction].slice(-6) }));
    if (!isMockMode) {
      await supabase
        .from('interactions')
        .insert({ couple_id: interaction.couple_id, sender_id: interaction.sender_id, receiver_id: interaction.receiver_id, type });
    }
  },

  addFurniture: async (profile, type) => {
    if (!profile.couple_id) {
      return;
    }
    const next: RoomFurniture = {
      id: makeUuid(),
      couple_id: profile.couple_id,
      type,
      x: 70 + Math.floor(Math.random() * 170),
      y: 80 + Math.floor(Math.random() * 130)
    };
    const furniture = [...get().furniture, next];
    set({ furniture });

    if (isMockMode) {
      await saveMockFurniture(profile.couple_id, furniture);
      return;
    }
    await (supabase as any).from('room_furniture').insert(next);
  },

  moveFurniture: async (profile, furnitureId) => {
    if (!profile.couple_id) {
      return;
    }
    const furniture = get().furniture.map((item) =>
      item.id === furnitureId
        ? {
            ...item,
            x: item.x > 210 ? 52 : item.x + 42,
            y: item.y > 235 ? 72 : item.y + 24
          }
        : item
    );
    const moved = furniture.find((item) => item.id === furnitureId);
    set({ furniture });

    if (isMockMode) {
      await saveMockFurniture(profile.couple_id, furniture);
      return;
    }
    if (moved) {
      await (supabase as any).from('room_furniture').upsert(moved, { onConflict: 'id' });
    }
  },

  saveAnswer: async (profile, answer) => {
    const question = get().question;
    if (!profile.couple_id || !question || !answer.trim()) {
      return;
    }
    const nextAnswer: DailyAnswer = {
      id: makeId('answer'),
      question_id: question.id,
      couple_id: profile.couple_id,
      user_id: profile.id,
      answer: answer.trim(),
      created_at: new Date().toISOString()
    };
    set((state) => ({
      answers: [...state.answers.filter((item) => item.user_id !== profile.id || item.question_id !== question.id), nextAnswer]
    }));
    if (!isMockMode) {
      await supabase.from('daily_answers').upsert(nextAnswer, { onConflict: 'question_id,couple_id,user_id' });
    }
  },

  leaveRealtime: () => {
    const profile = get().myPresence;
    unsubscribe(get().channel);
    set({
      channel: null,
      myPresence: profile ? { ...profile, is_online: false, last_seen: new Date().toISOString() } : null
    });
  }
}));
