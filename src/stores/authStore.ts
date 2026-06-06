import { create } from 'zustand';
import { Session } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isMockMode, supabase } from '../lib/supabase';
import { Profile } from '../types/models';

type AuthState = {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  bootstrap: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, nickname: string) => Promise<void>;
  loadProfile: (userId: string) => Promise<void>;
  updateNickname: (nickname: string) => Promise<void>;
  setProfile: (profile: Profile | null) => void;
  logout: () => Promise<void>;
};

const MOCK_USER_ID = '00000000-0000-4000-8000-000000000001';

async function readMockProfile() {
  const stored = await AsyncStorage.getItem('mock-profile');
  return stored ? (JSON.parse(stored) as Profile) : null;
}

async function saveMockProfile(profile: Profile) {
  await AsyncStorage.setItem('mock-profile', JSON.stringify(profile));
}

function normalizeNickname(nickname: string) {
  return nickname.trim() || '나';
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  profile: null,
  loading: false,
  error: null,

  bootstrap: async () => {
    set({ loading: true, error: null });
    try {
      if (isMockMode) {
        const profile = await readMockProfile();
        set({
          session: profile ? ({ user: { id: profile.id, email: 'mock@couple.room' } } as Session) : null,
          profile
        });
        return;
      }

      const { data, error } = await supabase.auth.getSession();
      if (error) {
        throw error;
      }
      set({ session: data.session });
      if (data.session?.user.id) {
        await get().loadProfile(data.session.user.id);
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '초기화에 실패했어요.' });
    } finally {
      set({ loading: false });
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      if (isMockMode) {
        const profile =
          (await readMockProfile()) ?? {
            id: MOCK_USER_ID,
            nickname: email.split('@')[0] || '나',
            avatar_type: 'peach',
            couple_id: null
          };
        await saveMockProfile(profile);
        set({ session: { user: { id: profile.id, email } } as Session, profile });
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !data.user) {
        throw error ?? new Error('로그인 정보를 확인할 수 없어요.');
      }
      set({ session: data.session });
      await get().loadProfile(data.user.id);
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '로그인에 실패했어요.' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  signup: async (email, password, nickname) => {
    set({ loading: true, error: null });
    try {
      const nextNickname = normalizeNickname(nickname);
      if (isMockMode) {
        const profile: Profile = {
          id: MOCK_USER_ID,
          nickname: nextNickname,
          avatar_type: 'peach',
          couple_id: null
        };
        await saveMockProfile(profile);
        set({ session: { user: { id: profile.id, email } } as Session, profile });
        return;
      }

      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error || !data.user) {
        throw error ?? new Error('가입 정보를 확인할 수 없어요.');
      }
      const profile: Profile = {
        id: data.user.id,
        nickname: nextNickname,
        avatar_type: 'peach',
        couple_id: null
      };
      const { error: profileError } = await supabase.from('profiles').upsert(profile);
      if (profileError) {
        throw profileError;
      }
      set({ session: data.session, profile });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '회원가입에 실패했어요.' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  loadProfile: async (userId) => {
    if (isMockMode) {
      set({ profile: await readMockProfile() });
      return;
    }

    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (error) {
      throw error;
    }
    set({ profile: data });
  },

  updateNickname: async (nickname) => {
    const profile = get().profile;
    if (!profile) {
      return;
    }

    const nextProfile = { ...profile, nickname: normalizeNickname(nickname) };
    set({ profile: nextProfile });

    if (isMockMode) {
      await saveMockProfile(nextProfile);
      return;
    }

    const { error } = await supabase.from('profiles').update({ nickname: nextProfile.nickname }).eq('id', profile.id);
    if (error) {
      set({ profile });
      throw error;
    }
  },

  setProfile: (profile) => {
    set({ profile });
    if (isMockMode && profile) {
      saveMockProfile(profile);
    }
  },

  logout: async () => {
    if (isMockMode) {
      await AsyncStorage.removeItem('mock-profile');
      set({ session: null, profile: null });
      return;
    }
    await supabase.auth.signOut();
    set({ session: null, profile: null });
  }
}));
