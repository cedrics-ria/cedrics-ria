export const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || '';

// Zentrale localStorage-Keys — nie Magic Strings im Code verteilen
export const STORAGE_KEYS = {
  HANDLED_BOOKINGS: 'ria-handled-bookings',
  LAST_MSG_CHECK: 'ria-last-msg-check',
  CURRENT_USER: 'ria-current-user',
  FAVORITES: 'ria-favorites',
  hiddenThreads: (userId) => `ria-hidden-threads-${userId}`,
  RECENTLY_VIEWED: 'ria-recently-viewed',
  COOKIE_CONSENT: 'ria-cookie-consent',
};

export const C = {
  forest: '#1C3A2E',
  sage: '#7A9E7E',
  sageLight: '#EAF0EB',
  terra: '#C4714A',
  cream: '#F7F3EC',
  ink: '#1A1714',
  muted: '#7A7470',
  gold: '#C8A96B',
  line: 'rgba(28,58,46,0.10)',
  shadow: '0 18px 50px rgba(28,58,46,0.10)',
};

export const categoryImages = {
  Werkzeug: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=1200&q=80',
  Technik: 'https://images.unsplash.com/photo-1528395874238-34ebe249b3f2?w=1200&q=80',
  Outdoor: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1200&q=80',
  Sport: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=1200&q=80',
  // Legacy — bestehende Inserate mit alter Kategorie bleiben funktionsfähig
  'Outdoor & Sport': 'https://images.unsplash.com/photo-1533240332313-0db49b459ad6?w=1200&q=80',
  'Foto & Technik': 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1200&q=80',
  'Party & Events': 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1200&q=80',
  Musik: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=1200&q=80',
  'Bücher & Uni': 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1200&q=80',
  Transport: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80',
  Gaming: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=1200&q=80',
  Sonstiges: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&q=80',
};

export const allCategoryNames = [
  'Werkzeug',
  'Technik',
  'Outdoor',
  'Sport',
  'Foto & Technik',
  'Party & Events',
  'Musik',
  'Bücher & Uni',
  'Transport',
  'Gaming',
  'Sonstiges',
  // Legacy-Wert damit alte Inserate nicht leer angezeigt werden
  'Outdoor & Sport',
];

export const categories = [
  { name: 'Outdoor', img: categoryImages.Outdoor },
  { name: 'Sport', img: categoryImages.Sport },
  { name: 'Werkzeug', img: categoryImages.Werkzeug },
  { name: 'Foto & Technik', img: categoryImages['Foto & Technik'] },
  { name: 'Party & Events', img: categoryImages['Party & Events'] },
  { name: 'Musik', img: categoryImages.Musik },
  { name: 'Bücher & Uni', img: categoryImages['Bücher & Uni'] },
  { name: 'Transport', img: categoryImages.Transport },
  { name: 'Gaming', img: categoryImages.Gaming },
];

export const steps = [
  {
    num: '01',
    title: 'Suchen oder Inserieren',
    desc: 'Durchstöbere Gegenstände in deiner Nähe oder biete deine eigenen an und verdiene nebenbei.',
  },
  {
    num: '02',
    title: 'Kontakt & Einigung',
    desc: 'Schreibe dem Vermieter direkt, einige dich auf Preis und Zeitraum und klärt die Übergabe.',
  },
  {
    num: '03',
    title: 'Abholen & Nutzen',
    desc: 'Trefft euch lokal, übergebt den Gegenstand und gebt euch danach Feedback.',
  },
];

/**
 * @typedef {Object} Listing
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {number} price
 * @property {string} category
 * @property {string} location
 * @property {string[]} images
 * @property {string} owner_id
 * @property {string} [owner_name]
 * @property {boolean} [is_available]
 * @property {string} created_at
 */

/**
 * @typedef {Object} Message
 * @property {string} id
 * @property {string} from_user_id
 * @property {string} to_user_id
 * @property {string} text
 * @property {string} [message_type]
 * @property {string} listing_id
 * @property {string} [listing_title]
 * @property {string} created_at
 * @property {boolean} [read]
 */

/**
 * @typedef {Object} Booking
 * @property {string} id
 * @property {string} listing_id
 * @property {string} renter_id
 * @property {string} owner_id
 * @property {string} start_date
 * @property {string} end_date
 * @property {string} status
 * @property {number} [total_price]
 * @property {string} created_at
 */

/**
 * @typedef {Object} UserProfile
 * @property {string} id
 * @property {string} name
 * @property {string} [avatar_url]
 * @property {string} [bio]
 * @property {boolean} [is_banned]
 * @property {string} created_at
 */

/**
 * @typedef {Object} Review
 * @property {string} id
 * @property {string} listing_id
 * @property {string} reviewer_id
 * @property {string} [reviewer_name]
 * @property {number} rating
 * @property {string} [text]
 * @property {string} created_at
 */

