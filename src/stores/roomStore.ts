import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RealtimeChannel } from '@supabase/supabase-js';
import { createInviteCode, isMockMode, supabase } from '../lib/supabase';
import { subscribeToRoom, unsubscribe } from '../lib/realtime';
import { Couple, DailyAnswer, DailyQuestion, Interaction, Message, Point, Profile, RoomPresence } from '../types/models';

type RoomState = {
  couple: Couple | null;
  myPresence: RoomPresence | null;
  partnerPresence: RoomPresence | null;
  messages: Message[];
  interactions: Interaction[];
  question: DailyQuestion | null;
  answers: DailyAnswer[];
  loading: boolean;
  error: string | null;
  channel: RealtimeChannel | null;
  createInvite: (userId: string) => Promise<Couple>;
  joinInvite: (inviteCode: string, userId: string) => Promise<Couple>;
  loadRoom: (profile: Profile) => Promise<void>;
  updatePosition: (profile: Profile, point: Point) => Promise<void>;
  sendMessage: (profile: Profile, content: string) => Promise<void>;
  sendHug: (profile: Profile, receiverId: string) => Promise<void>;
  saveAnswer: (profile: Profile, answer: string) => Promise<void>;
  leaveRealtime: () => void;
};

const today = () => new Date().toISOString().slice(0, 10);

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function readMockCouple() {
  const stored = await AsyncStorage.getItem('mock-couple');
  return stored ? (JSON.parse(stored) as Couple) : null;
}

async function saveMockCouple(couple: Couple) {
  await AsyncStorage.setItem('mock-couple', JSON.stringify(couple));
}

export const useRoomStore = create<RoomState>((set, get) => ({
  couple: null,
  myPresence: null,
  partnerPresence: null,
  messages: [],
  interactions: [],
  question: null,
  answers: [],
  loading: false,
  error: null,
  channel: null,

  createInvite: async (userId) => {
    set({ loading: true, error: null });
    try {
      const invite_code = createInviteCode();
      if (isMockMode) {
        const couple: Couple = {
          id: makeId('couple'),
          invite_code,
          user1_id: userId,
          user2_id: null
        };
        await saveMockCouple(couple);
        set({ couple });
        return couple;
      }

      const { data, error } = await supabase
        .from('couples')
        .insert({ invite_code, user1_id: userId })
        .select('*')
        .single();
      if (error) {
        throw error;
      }
      await supabase.from('profiles').update({ couple_id: data.id }).eq('id', userId);
      set({ couple: data });
      return data;
    } finally {
      set({ loading: false });
    }
  },

  joinInvite: async (inviteCode, userId) => {
    set({ loading: true, error: null });
    try {
      if (isMockMode) {
        const existing = (await readMockCouple()) ?? {
          id: makeId('couple'),
          invite_code: inviteCode.toUpperCase(),
          user1_id: 'partner-user',
          user2_id: null
        };
        const couple = { ...existing, user2_id: userId };
        await saveMockCouple(couple);
        set({ couple });
        return couple;
      }

      const { data: couple, error } = await supabase
        .from('couples')
        .select('*')
        .eq('invite_code', inviteCode.toUpperCase())
        .is('user2_id', null)
        .single();
      if (error) {
        throw error;
      }
      const { data, error: updateError } = await supabase
        .from('couples')
        .update({ user2_id: userId })
        .eq('id', couple.id)
        .select('*')
        .single();
      if (updateError) {
        throw updateError;
      }
      await supabase.from('profiles').update({ couple_id: data.id }).eq('id', userId);
      set({ couple: data });
      return data;
    } finally {
      set({ loading: false });
    }
  },

  loadRoom: async (profile) => {
    if (!profile.couple_id) {
      return;
    }

    get().leaveRealtime();
    set({ loading: true, error: null });
    try {
      if (isMockMode) {
        const couple = (await readMockCouple()) ?? {
          id: profile.couple_id,
          invite_code: 'MOCK12',
          user1_id: profile.id,
          user2_id: 'partner-user'
        };
        set({
          couple,
          question: {
            id: 'mock-question',
            question: '오늘 서로에게 가장 고마웠던 순간은 언제였나요?',
            active_date: today()
          },
          partnerPresence: {
            id: 'mock-presence-partner',
            couple_id: couple.id,
            user_id: 'partner-user',
            x: 230,
            y: 160,
            is_online: true,
            last_seen: new Date().toISOString()
          },
          myPresence: {
            id: 'mock-presence-me',
            couple_id: couple.id,
            user_id: profile.id,
            x: 110,
            y: 210,
            is_online: true,
            last_seen: new Date().toISOString()
          }
        });
        return;
      }

      const [{ data: couple }, { data: presence }, { data: messages }, { data: question }, { data: answers }] =
        await Promise.all([
          supabase.from('couples').select('*').eq('id', profile.couple_id).single(),
          supabase.from('room_presence').select('*').eq('couple_id', profile.couple_id),
          supabase
            .from('messages')
            .select('*')
            .eq('couple_id', profile.couple_id)
            .order('created_at', { ascending: false })
            .limit(50),
          supabase.from('daily_questions').select('*').eq('active_date', today()).maybeSingle(),
          supabase.from('daily_answers').select('*').eq('couple_id', profile.couple_id)
        ]);

      const myPresence = presence?.find((item) => item.user_id === profile.id) ?? null;
      const partnerPresence = presence?.find((item) => item.user_id !== profile.id) ?? null;
      set({
        couple: couple ?? null,
        myPresence,
        partnerPresence,
        messages: [...(messages ?? [])].reverse(),
        question: question ?? null,
        answers: answers ?? []
      });

      const channel = subscribeToRoom(profile.couple_id, {
        onPresence: (nextPresence) => {
          if (nextPresence.user_id === profile.id) {
            set({ myPresence: nextPresence });
          } else {
            set({ partnerPresence: nextPresence });
          }
        },
        onMessage: (message) => set((state) => ({ messages: [...state.messages, message].slice(-50) })),
        onInteraction: (interaction) => set((state) => ({ interactions: [...state.interactions, interaction].slice(-6) }))
      });
      set({ channel });
    } finally {
      set({ loading: false });
    }
  },

  updatePosition: async (profile, point) => {
    if (!profile.couple_id) {
      return;
    }
    const presence: RoomPresence = {
      id: get().myPresence?.id ?? makeId('presence'),
      couple_id: profile.couple_id,
      user_id: profile.id,
      x: point.x,
      y: point.y,
      is_online: true,
      last_seen: new Date().toISOString()
    };
    set({ myPresence: presence });
    if (isMockMode) {
      return;
    }
    await supabase.from('room_presence').upsert(presence, { onConflict: 'couple_id,user_id' });
  },

  sendMessage: async (profile, content) => {
    if (!profile.couple_id || !content.trim()) {
      return;
    }
    const message: Message = {
      id: makeId('message'),
      couple_id: profile.couple_id,
      sender_id: profile.id,
      content: content.trim(),
      created_at: new Date().toISOString()
    };
    set((state) => ({ messages: [...state.messages, message].slice(-50) }));
    if (!isMockMode) {
      await supabase.from('messages').insert({
        couple_id: message.couple_id,
        sender_id: message.sender_id,
        content: message.content
      });
    }
  },

  sendHug: async (profile, receiverId) => {
    if (!profile.couple_id) {
      return;
    }
    const interaction: Interaction = {
      id: makeId('interaction'),
      couple_id: profile.couple_id,
      sender_id: profile.id,
      receiver_id: receiverId,
      type: 'hug',
      created_at: new Date().toISOString()
    };
    set((state) => ({ interactions: [...state.interactions, interaction].slice(-6) }));
    if (!isMockMode) {
      await supabase.from('interactions').insert(interaction);
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
    unsubscribe(get().channel);
    set({ channel: null });
  }
}));
