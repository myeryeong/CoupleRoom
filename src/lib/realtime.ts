import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { Interaction, Message, RealtimePresenceState, RoomFurniture } from '../types/models';

type PresenceHandler = (presences: RealtimePresenceState[]) => void;
type MessageHandler = (message: Message) => void;
type InteractionHandler = (interaction: Interaction) => void;
type FurnitureHandler = (furniture: RoomFurniture) => void;

export function subscribeToRoom(
  coupleId: string,
  initialPresence: RealtimePresenceState,
  handlers: {
    onPresence: PresenceHandler;
    onMessage: MessageHandler;
    onInteraction: InteractionHandler;
    onFurniture: FurnitureHandler;
  }
): RealtimeChannel {
  const channel = supabase
    .channel(`room:${coupleId}`, {
      config: {
        presence: {
          key: initialPresence.user_id
        }
      }
    })
    .on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      const presences = Object.values(state)
        .flat()
        .map((item) => item as unknown as RealtimePresenceState);
      handlers.onPresence(presences);
    })
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
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'room_presence',
        filter: `couple_id=eq.${coupleId}`
      },
      () => undefined
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'room_furniture',
        filter: `couple_id=eq.${coupleId}`
      },
      (payload) => handlers.onFurniture(payload.new as RoomFurniture)
    );

  channel.subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await channel.track(initialPresence);
    }
  });

  return channel;
}

export async function trackRoomPresence(channel: RealtimeChannel | null, presence: RealtimePresenceState) {
  if (channel) {
    await channel.track(presence);
  }
}

export function unsubscribe(channel?: RealtimeChannel | null) {
  if (channel) {
    channel.untrack();
    supabase.removeChannel(channel);
  }
}
