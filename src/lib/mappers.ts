import type { Message, Listing } from '../types';

/**
 * Maps a raw DB message row to a normalized Message object.
 */
export function mapMessageFromDb(row: Record<string, unknown>): Message {
  return {
    id: row.id as string,
    fromUserId: row.from_user_id as string,
    fromName: (row.from_name as string) ?? '',
    toUserId: row.to_user_id as string,
    text: (row.text as string) ?? '',
    messageType: (row.message_type as Message['messageType']) ?? 'normal',
    listingId: (row.listing_id as string) ?? null,
    listingTitle: (row.listing_title as string) ?? null,
    createdAt: row.created_at as string,
    read: (row.read as boolean) ?? false,
  };
}

/**
 * Maps a raw DB listing row to a normalized Listing object.
 * Uses the same field names as the rest of the app (userId, ownerName, etc.)
 */
export function mapListingFromDb(row: Record<string, unknown>): Listing {
  return {
    id: row.id as string,
    title: (row.title as string) ?? '',
    description: (row.description as string) ?? '',
    price: (row.price as string) ?? '0',
    category: (row.category as string) ?? '',
    location: (row.location as string) ?? '',
    image: (row.image as string) ?? null,
    images: Array.isArray(row.images) ? (row.images as string[]) : [],
    userId: (row.user_id as string) ?? null,
    ownerName: (row.owner_name as string) ?? 'Ria Mitglied',
    isAvailable: (row.is_available as boolean) ?? true,
    featured: false,
    status: 'aktiv',
    rating: 0,
    reviews: 0,
    kaution: (row.kaution as string) ?? '',
    paymentMethods: Array.isArray(row.payment_methods) ? (row.payment_methods as string[]) : [],
    plz: (row.plz as string) ?? '',
    createdAt: row.created_at as string,
    views: (row.views as number) ?? 0,
  };
}
