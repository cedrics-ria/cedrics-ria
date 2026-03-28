import { useState, useCallback } from 'react';
import { supabase } from '../supabase';
import type { Booking } from '../types';

interface UseBookingsReturn {
  bookings: Booking[];
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
  loadBookings: (userId: string) => Promise<void>;
  createBooking: (bookingData: Partial<Booking>) => Promise<{ ok: true; booking: Booking } | { ok: false; error: unknown }>;
  updateBookingStatus: (id: string, status: Booking['status']) => Promise<{ ok: boolean }>;
}

export function useBookings(): UseBookingsReturn {
  const [bookings, setBookings] = useState<Booking[]>([]);

  const loadBookings = useCallback(async (userId: string) => {
    if (!userId) return;
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .or(`requester_id.eq.${userId},owner_id.eq.${userId}`)
        .order('created_at', { ascending: false });
      if (error) {
        if (import.meta.env.DEV) console.warn('[useBookings] loadBookings:', error);
        return;
      }
      setBookings((data ?? []) as Booking[]);
    } catch (err) {
      if (import.meta.env.DEV) console.warn('[useBookings] loadBookings:', err);
    }
  }, []);

  const createBooking = useCallback(async (bookingData: Partial<Booking>) => {
    try {
      const { data, error } = await supabase.from('bookings').insert([bookingData]).select().single();
      if (error) throw error;
      setBookings((prev) => [data as Booking, ...prev]);
      return { ok: true as const, booking: data as Booking };
    } catch (err) {
      if (import.meta.env.DEV) console.warn('[useBookings] createBooking:', err);
      return { ok: false as const, error: err };
    }
  }, []);

  const updateBookingStatus = useCallback(async (id: string, status: Booking['status']) => {
    try {
      const { data, error } = await supabase.from('bookings').update({ status }).eq('id', id).select().single();
      if (error) throw error;
      setBookings((prev) => prev.map((b) => (b.id === id ? (data as Booking) : b)));
      return { ok: true };
    } catch (err) {
      if (import.meta.env.DEV) console.warn('[useBookings] updateBookingStatus:', err);
      return { ok: false };
    }
  }, []);

  return { bookings, setBookings, loadBookings, createBooking, updateBookingStatus };
}
