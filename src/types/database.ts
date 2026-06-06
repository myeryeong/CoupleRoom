export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          nickname: string;
          avatar_type: string;
          couple_id: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          nickname: string;
          avatar_type?: string;
          couple_id?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
        Relationships: [];
      };
      couples: {
        Row: {
          id: string;
          invite_code: string;
          user1_id: string;
          user2_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          invite_code: string;
          user1_id: string;
          user2_id?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['couples']['Insert']>;
        Relationships: [];
      };
      room_presence: {
        Row: {
          id: string;
          couple_id: string;
          user_id: string;
          x: number;
          y: number;
          is_online: boolean;
          last_seen: string;
        };
        Insert: {
          id?: string;
          couple_id: string;
          user_id: string;
          x?: number;
          y?: number;
          is_online?: boolean;
          last_seen?: string;
        };
        Update: Partial<Database['public']['Tables']['room_presence']['Insert']>;
        Relationships: [];
      };
      messages: {
        Row: {
          id: string;
          couple_id: string;
          sender_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          couple_id: string;
          sender_id: string;
          content: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['messages']['Insert']>;
        Relationships: [];
      };
      interactions: {
        Row: {
          id: string;
          couple_id: string;
          sender_id: string;
          receiver_id: string;
          type: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          couple_id: string;
          sender_id: string;
          receiver_id: string;
          type: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['interactions']['Insert']>;
        Relationships: [];
      };
      daily_questions: {
        Row: {
          id: string;
          question: string;
          active_date: string;
        };
        Insert: {
          id?: string;
          question: string;
          active_date: string;
        };
        Update: Partial<Database['public']['Tables']['daily_questions']['Insert']>;
        Relationships: [];
      };
      daily_answers: {
        Row: {
          id: string;
          question_id: string;
          couple_id: string;
          user_id: string;
          answer: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          question_id: string;
          couple_id: string;
          user_id: string;
          answer: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['daily_answers']['Insert']>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
