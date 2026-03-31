export interface AppUser {
  id: string;
  name: string;
  email: string;
  emailConfirmed: boolean;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: string;
  category: string;
  location: string;
  image?: string | null;
  images: string[];
  userId: string | null;
  ownerName: string;
  isAvailable: boolean;
  featured: boolean;
  status: string;
  rating: number;
  reviews: number;
  kaution: string;
  paymentMethods: string[];
  plz: string;
  createdAt: string;
}

export interface Message {
  id: string;
  fromUserId: string;
  toUserId: string;
  text: string;
  messageType: 'normal' | 'booking_request' | 'booking_accepted' | 'booking_declined';
  listingId: string | null;
  listingTitle: string | null;
  createdAt: string;
  read: boolean;
}

export interface Booking {
  id: string;
  listing_id: string;
  listing_title: string;
  requester_id: string;
  requester_name: string;
  owner_id: string;
  start_date: string;
  end_date: string;
  start_time?: string | null;
  end_time?: string | null;
  booking_mode?: 'days' | 'hours';
  owner_confirmed_return?: boolean;
  renter_confirmed_return?: boolean;
  completed_at?: string | null;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  created_at: string;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar_url?: string | null;
  bio?: string | null;
  is_banned?: boolean;
  is_admin?: boolean;
  created_at: string;
}

export interface Review {
  id: string;
  listing_id: string;
  reviewer_id: string;
  reviewer_name?: string;
  rating: number;
  text?: string;
  created_at: string;
}

export interface Toast {
  id: number;
  text: string;
  type: 'info' | 'error' | 'success';
}

export interface SupportRequest {
  id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  created_at: string;
}

export interface PushSubscription {
  user_id: string;
  subscription: object;
  updated_at: string;
}
