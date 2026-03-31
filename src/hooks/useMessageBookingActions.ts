import { useState } from 'react';
import { supabase } from '../supabase';
import { mapMessageFromDb } from '../lib/mappers';
import { STORAGE_KEYS } from '../constants';
import type { AppUser, Message, Booking } from '../types';

interface UseMessageBookingActionsOptions {
  currentUser: AppUser | null;
  addToast: (text: string, type?: string) => void;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  bookings: Booking[];
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
  loadBookings: (userId: string) => Promise<void>;
}

export function useMessageBookingActions({
  currentUser,
  addToast,
  setMessages,
  bookings,
  setBookings,
  loadBookings,
}: UseMessageBookingActionsOptions) {
  const [handledBookings, setHandledBookings] = useState<Record<string, string>>(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.HANDLED_BOOKINGS) || '{}'); }
    catch { return {}; }
  });

  async function saveMessage(newMessage: { listingId: string; listingTitle: string | null; toUserId: string; text: string }): Promise<boolean> {
    if (!currentUser) return false;
    if (newMessage.toUserId === currentUser.id) return false; // can't message yourself
    const { data, error } = await supabase.from('messages').insert({
      listing_id: newMessage.listingId, listing_title: newMessage.listingTitle,
      from_user_id: currentUser.id, from_name: currentUser.name, from_email: currentUser.email,
      to_user_id: newMessage.toUserId, text: newMessage.text,
    }).select().single();
    if (error) {
      console.error('[saveMessage]', error);
      addToast('Nachricht konnte nicht gesendet werden. Bitte versuche es erneut.', 'error');
      return false;
    }
    setMessages((prev) => [mapMessageFromDb(data), ...prev]);
    // Fire-and-forget email notification
    supabase.auth.getSession().then(({ data: sessionData }) => {
      fetch('/api/send-message-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionData.session?.access_token || ''}`,
        },
        body: JSON.stringify({
          record: {
            to_user_id: newMessage.toUserId,
            from_name: currentUser.name,
            text: newMessage.text,
            listing_title: newMessage.listingTitle,
          },
        }),
      }).catch((err) => {
        if (import.meta.env.DEV) console.warn('[saveMessage] Email-Benachrichtigung fehlgeschlagen:', err);
      });
    });
    return true;
  }

  async function bookListing(
    listingId: string, listingTitle: string, ownerId: string,
    startDate: string, endDate: string, startTime: string | null, endTime: string | null, bookingMode: string
  ) {
    if (!currentUser) return;
    const { error } = await supabase.from('bookings').insert({
      listing_id: String(listingId), listing_title: listingTitle,
      requester_id: currentUser.id, requester_name: currentUser.name,
      owner_id: ownerId, start_date: startDate, end_date: endDate, status: 'pending',
      start_time: startTime || null, end_time: endTime || null, booking_mode: bookingMode || 'days',
    });
    if (error) { console.error('[bookListing]', error); addToast('Buchungsanfrage konnte nicht gesendet werden. Bitte versuche es erneut.', 'error'); return; }
    const fmt = (d: string) => d.split('-').reverse().join('.');
    const bookingText = bookingMode === 'hours' && startTime && endTime
      ? `Buchungsanfrage: ${listingTitle}\n\nZeitraum: ${fmt(startDate)}, ${startTime} – ${endTime}\n\nHallo, ich würde gerne "${listingTitle}" für diesen Zeitraum buchen. Bitte gib mir Bescheid, ob das passt!`
      : `Buchungsanfrage: ${listingTitle}\n\nZeitraum: ${fmt(startDate)} – ${fmt(endDate)}\n\nHallo, ich würde gerne "${listingTitle}" für diesen Zeitraum buchen. Bitte gib mir Bescheid, ob das passt!`;
    await saveMessage({ listingId: String(listingId), listingTitle, toUserId: ownerId, text: bookingText });
    loadBookings(currentUser.id);
    addToast('Buchungsanfrage gesendet ✓', 'info');
  }

  async function acceptBookingRecord(bookingId: string) {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking || booking.owner_id !== currentUser?.id) { addToast('Keine Berechtigung.', 'error'); return; }
    const { error } = await supabase.from('bookings').update({ status: 'accepted' })
      .eq('id', bookingId).eq('owner_id', currentUser.id);
    if (error) { console.error('[acceptBookingRecord]', error); addToast('Buchung konnte nicht angenommen werden.', 'error'); return; }
    setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status: 'accepted' as const } : b)));
    addToast('Buchung angenommen ✓', 'info');
  }

  async function declineBookingRecord(bookingId: string) {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking || booking.owner_id !== currentUser?.id) { addToast('Keine Berechtigung.', 'error'); return; }
    const { error } = await supabase.from('bookings').update({ status: 'declined' })
      .eq('id', bookingId).eq('owner_id', currentUser.id);
    if (error) { console.error('[declineBookingRecord]', error); addToast('Buchung konnte nicht abgelehnt werden.', 'error'); return; }
    setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status: 'declined' as const } : b)));
    addToast('Buchung abgelehnt.', 'info');
  }

  async function confirmReturn(bookingId: string, role: 'owner' | 'renter') {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking || !currentUser) return;
    const isOwnerRole = role === 'owner';
    const field = isOwnerRole ? 'owner_confirmed_return' : 'renter_confirmed_return';
    const otherConfirmed = isOwnerRole ? booking.renter_confirmed_return : booking.owner_confirmed_return;
    const updatePayload: Record<string, unknown> = { [field]: true };
    if (otherConfirmed) {
      updatePayload.status = 'completed';
      updatePayload.completed_at = new Date().toISOString();
    }
    const { error } = await supabase.from('bookings').update(updatePayload).eq('id', bookingId);
    if (error) { console.error('[confirmReturn]', error); addToast('Rückgabe konnte nicht bestätigt werden.', 'error'); return; }
    setBookings((prev) => prev.map((b) => b.id === bookingId ? { ...b, ...updatePayload } : b));
    addToast(otherConfirmed ? 'Transaktion abgeschlossen ✓' : 'Rückgabe bestätigt ✓', 'info');
  }

  async function acceptBooking(msg: Message) {
    if (!currentUser) return;
    await saveMessage({ listingId: msg.listingId!, listingTitle: msg.listingTitle, toUserId: msg.fromUserId, text: '✓ Buchungsanfrage angenommen! Melde dich gerne für Details zur Übergabe.' });
    const updated = { ...handledBookings, [msg.id]: 'accepted' };
    setHandledBookings(updated);
    localStorage.setItem(STORAGE_KEYS.HANDLED_BOOKINGS, JSON.stringify(updated));
    addToast('Buchung angenommen ✓', 'info');
  }

  async function declineBooking(msg: Message) {
    if (!currentUser) return;
    await saveMessage({ listingId: msg.listingId!, listingTitle: msg.listingTitle, toUserId: msg.fromUserId, text: 'Leider kann ich die Buchungsanfrage gerade nicht annehmen. Schau gerne nach anderen Inseraten auf ria!' });
    const updated = { ...handledBookings, [msg.id]: 'declined' };
    setHandledBookings(updated);
    localStorage.setItem(STORAGE_KEYS.HANDLED_BOOKINGS, JSON.stringify(updated));
    addToast('Buchung abgelehnt.', 'info');
  }

  return {
    handledBookings,
    saveMessage,
    bookListing,
    acceptBookingRecord,
    declineBookingRecord,
    confirmReturn,
    acceptBooking,
    declineBooking,
  };
}
