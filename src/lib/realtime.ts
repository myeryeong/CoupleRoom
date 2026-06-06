import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { Interaction, Message, RoomPresence } from '../types/models';

type PresenceHandler = (presence: RoomPresence) => void;
type MessageHandler = (message: Message) => void;
type InteractionHandler = (interaction: Interaction) => void;

export function subscribeToRoom(
  coupleId: string,
  handlers: {
    onPresence: PresenceHandler;
    onMessage: MessageHandler;
    onInteraction: InteractionHandler;
  }
): RealtimeChannel {
  const channel = supabase
    .channel(`couple-room:${coupleId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'room_presence',
        filter: `couple_id=eq.${coupleId}`
      },
      (payload) => handlers.onPresence(payload.new as RoomPresence)
    )
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `couple_id=eq.${coupleId}`
      },
      (payload) => handlers.onMessage(payload.new as Message)
    )
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'interactions',
        filter: `couple_id=eq.${coupleId}`
      },
      (payload) => handlers.onInteraction(payload.new as Interaction)
    );

  channel.subscribe();
  return channel;
}

export function unsubscribe(channel?: RealtimeChannel | null) {
  if (channel) {
    supabase.removeChannel(channel);
  }
}
