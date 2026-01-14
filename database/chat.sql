-- Messages Table for Real-time Chat
create table messages (
  id uuid default uuid_generate_v4() primary key,
  sender_id uuid references profiles(id) not null,
  receiver_id uuid references profiles(id) not null,
  content text not null,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table messages enable row level security;

-- Policies
create policy "Users can view their own messages."
  on messages for select
  using ( auth.uid() = sender_id or auth.uid() = receiver_id );

create policy "Users can send messages."
  on messages for insert
  with check ( auth.uid() = sender_id );

-- Realtime subscription is enabled by default on Supabase for public tables, 
-- but for RLS tables we need to ensure the client subscribes with the right filter.
