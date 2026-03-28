import { useState, useCallback } from 'react';
import { supabase } from '../supabase';
import { mapMessageFromDb } from '../lib/mappers';
import type { Message } from '../types';

interface UseMessagesReturn {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  loadMessages: (userId: string) => Promise<void>;
  saveMessage: (userId: string, toUserId: string, text: string, listingId: string | null, listingTitle: string | null, messageType?: Message['messageType']) => Promise<Message | false>;
  markMessagesRead: (fromUserId: string, toUserId: string) => Promise<void>;
}

export function useMessages(): UseMessagesReturn {
  const [messages, setMessages] = useState<Message[]>([]);

  const loadMessages = useCallback(async (userId: string) => {
    if (!userId) return;
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`)
        .order('created_at', { ascending: true });
      if (error) throw error;
      setMessages((data ?? []).map(mapMessageFromDb));
    } catch (err) {
      if (import.meta.env.DEV) console.warn('[useMessages] loadMessages:', err);
    }
  }, []);

  const saveMessage = useCallback(async (
    userId: string,
    toUserId: string,
    text: string,
    listingId: string | null,
    listingTitle: string | null,
    messageType: Message['messageType'] = 'normal'
  ): Promise<Message | false> => {
    if (!userId) return false;
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([{ from_user_id: userId, to_user_id: toUserId, text, listing_id: listingId, listing_title: listingTitle, message_type: messageType }])
        .select()
        .single();
      if (error) throw error;
      const mapped = mapMessageFromDb(data);
      setMessages((prev) => [...prev, mapped]);
      return mapped;
    } catch (err) {
      if (import.meta.env.DEV) console.warn('[useMessages] saveMessage:', err);
      return false;
    }
  }, []);

  const markMessagesRead = useCallback(async (fromUserId: string, toUserId: string) => {
    try {
      await supabase
        .from('messages')
        .update({ read: true })
        .eq('from_user_id', fromUserId)
        .eq('to_user_id', toUserId)
        .eq('read', false);
      setMessages((prev) =>
        prev.map((m) => m.fromUserId === fromUserId && m.toUserId === toUserId ? { ...m, read: true } : m)
      );
    } catch (err) {
      if (import.meta.env.DEV) console.warn('[useMessages] markMessagesRead:', err);
    }
  }, []);

  return { messages, setMessages, loadMessages, saveMessage, markMessagesRead };
}
