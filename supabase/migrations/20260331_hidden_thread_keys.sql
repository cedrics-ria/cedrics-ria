-- Add hidden_thread_keys column to profiles table
-- Stores thread keys the user has hidden (e.g. "listing-123-other-user-456")
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS hidden_thread_keys TEXT[] DEFAULT '{}';
