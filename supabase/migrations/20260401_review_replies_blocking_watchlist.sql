-- Review owner replies
ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS owner_reply TEXT,
  ADD COLUMN IF NOT EXISTS owner_reply_at TIMESTAMPTZ;

-- User blocking (array of blocked user IDs stored in profile)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS blocked_user_ids TEXT[] DEFAULT '{}';

-- Watchlist for availability notifications
CREATE TABLE IF NOT EXISTS public.watchlist (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  listing_id  TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, listing_id)
);

ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "watchlist_select_own"
  ON public.watchlist FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "watchlist_insert_own"
  ON public.watchlist FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "watchlist_delete_own"
  ON public.watchlist FOR DELETE
  USING (auth.uid() = user_id);

-- Allow admins/service role to read watchlist (for sending notifications)
CREATE POLICY "watchlist_select_service"
  ON public.watchlist FOR SELECT
  USING (true);
