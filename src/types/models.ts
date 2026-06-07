export type Point = {
  x: number;
  y: number;
};

export type InteractionType = 'hug' | 'kiss' | 'pat';

export type FurnitureType = 'sofa' | 'table' | 'plant' | 'lamp' | 'rug';

export type Profile = {
  id: string;
  nickname: string;
  avatar_type: string;
  couple_id: string | null;
  created_at?: string;
};

export type Couple = {
  id: string;
  invite_code: string;
  user1_id: string;
  user2_id: string | null;
  created_at?: string;
};

export type RoomPresence = {
  id: string;
  couple_id: string;
  user_id: string;
  nickname?: string;
  x: number;
  y: number;
  is_online: boolean;
  last_seen: string;
};

export type RealtimePresenceState = {
  user_id: string;
  nickname: string;
  x: number;
  y: number;
  online_at: string;
};

export type Message = {
  id: string;
  couple_id: string;
  sender_id: string;
  sender_nickname: string;
  content: string;
  created_at: string;
};

export type Interaction = {
  id: string;
  couple_id: string;
  sender_id: string;
  receiver_id: string;
  type: InteractionType;
  created_at: string;
};

export type RoomFurniture = {
  id: string;
  couple_id: string;
  type: FurnitureType;
  x: number;
  y: number;
  rotation?: number;
  created_at?: string;
  updated_at?: string;
};

export type DailyQuestion = {
  id: string;
  question: string;
  active_date: string;
};

export type DailyAnswer = {
  id: string;
  question_id: string;
  couple_id: string;
  user_id: string;
  answer: string;
  created_at: string;
};
