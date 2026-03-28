-- Table for user-to-user reviews (e.g. owner rates renter after booking)
create table if not exists user_reviews (
  id uuid default gen_random_uuid() primary key,
  reviewer_id uuid references auth.users(id) on delete cascade not null,
  reviewee_id uuid references auth.users(id) on delete cascade not null,
  listing_id text not null,
  rating int check (rating >= 1 and rating <= 5) not null,
  text text default '' not null,
  created_at timestamptz default now() not null,
  unique(reviewer_id, reviewee_id, listing_id)
);

alter table user_reviews enable row level security;

create policy "Anyone can read user reviews"
  on user_reviews for select using (true);

create policy "Authenticated users can insert own reviews"
  on user_reviews for insert
  with check (auth.uid() = reviewer_id);
