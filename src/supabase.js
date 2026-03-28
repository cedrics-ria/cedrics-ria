import { createClient } from '@supabase/supabase-js';

// Supabase anon keys are intentionally public — security is enforced via Row Level Security (RLS).
// The fallback values allow the app to work without local .env setup during development.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://orlpqyszbokwtworbyjc.supabase.co';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ybHBxeXN6Ym9rd3R3b3JieWpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1MzU1MzMsImV4cCI6MjA5MDExMTUzM30.aag25mdcZR6M-KL0e4nJxv88ApzDNVDoNyalQKU3m8w';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
