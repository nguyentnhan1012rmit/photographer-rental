-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- -----------------------------------------------------------------------------
-- 1. PROFILES & AUTH
-- -----------------------------------------------------------------------------
create table profiles (
  id uuid references auth.users not null primary key,
  updated_at timestamp with time zone,
  full_name text,
  avatar_url text,
  role text check (role in ('customer', 'photographer', 'admin')) default 'customer',
  bio text,
  location text,
  username text unique,
  cover_photo_url text,
  website text,
  social_links jsonb default '{}',
  following_count integer default 0,
  followers_count integer default 0
);

-- Trigger to handle new user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url, role)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', COALESCE(new.raw_user_meta_data->>'role', 'customer'));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Profiles RLS
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select using ( true );

create policy "Users can insert their own profile."
  on profiles for insert with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update using ( auth.uid() = id );

create policy "Admins can update any profile."
  on profiles for update using (
    exists ( select 1 from profiles where id = auth.uid() and role = 'admin' )
  );

-- Function to promote (Admin Utility)
create or replace function promote_to_admin(user_email text)
returns void as $$
declare
  target_user_id uuid;
begin
  select id into target_user_id from auth.users where email = user_email;
  if target_user_id is not null then
    update profiles set role = 'admin' where id = target_user_id;
  end if;
end;
$$ language plpgsql;


-- -----------------------------------------------------------------------------
-- 2. SOCIAL GRAPH (Follows)
-- -----------------------------------------------------------------------------
create table follows (
  follower_id uuid references profiles(id) not null,
  following_id uuid references profiles(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (follower_id, following_id)
);

alter table follows enable row level security;

create policy "Follows are viewable by everyone" on follows for select using (true);
create policy "Users can follow others" on follows for insert with check (auth.uid() = follower_id);
create policy "Users can unfollow" on follows for delete using (auth.uid() = follower_id);

-- Trigger for follow counts
create or replace function update_follow_counts()
returns trigger as $$
begin
  if (TG_OP = 'INSERT') then
    update profiles set following_count = following_count + 1 where id = new.follower_id;
    update profiles set followers_count = followers_count + 1 where id = new.following_id;
  elsif (TG_OP = 'DELETE') then
    update profiles set following_count = following_count - 1 where id = old.follower_id;
    update profiles set followers_count = followers_count - 1 where id = old.following_id;
  end if;
  return null;
end;
$$ language plpgsql;

create trigger on_follow_change
  after insert or delete on follows
  for each row execute procedure update_follow_counts();


-- -----------------------------------------------------------------------------
-- 3. SERVICES & PORTFOLIO
-- -----------------------------------------------------------------------------
create table services (
  id uuid default uuid_generate_v4() primary key,
  photographer_id uuid references profiles(id) not null,
  title text not null,
  description text,
  price decimal(10, 2) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table services enable row level security;
create policy "Services are viewable by everyone." on services for select using ( true );
create policy "Photographers can insert their own services." on services for insert with check ( auth.uid() = photographer_id );
create policy "Photographers can delete their own services" on services for delete using ( auth.uid() = photographer_id );

create table portfolio_items (
  id uuid default uuid_generate_v4() primary key,
  photographer_id uuid references profiles(id) not null,
  image_url text not null,
  caption text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table portfolio_items enable row level security;
create policy "Portfolio items are viewable by everyone." on portfolio_items for select using ( true );
create policy "Photographers can manage their own portfolio." on portfolio_items for all using ( auth.uid() = photographer_id );


-- -----------------------------------------------------------------------------
-- 4. BOOKINGS & AVAILABILITY
-- -----------------------------------------------------------------------------
create table bookings (
  id uuid default uuid_generate_v4() primary key,
  customer_id uuid references profiles(id) not null,
  photographer_id uuid references profiles(id) not null,
  service_id uuid references services(id),
  status text check (status in ('pending', 'confirmed', 'completed', 'cancelled')) default 'pending',
  booking_date timestamp with time zone not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table bookings enable row level security;
create policy "Users can view their own bookings."
  on bookings for select using ( auth.uid() = customer_id or auth.uid() = photographer_id );
create policy "Customers can create bookings."
  on bookings for insert with check ( auth.uid() = customer_id );
create policy "Photographers can update bookings"
  on bookings for update using (auth.uid() = photographer_id);

create table availability (
  id uuid default uuid_generate_v4() primary key,
  photographer_id uuid references profiles(id) not null,
  unav_date date not null,
  reason text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(photographer_id, unav_date)
);

alter table availability enable row level security;
create policy "Availability is viewable by everyone." on availability for select using ( true );
create policy "Photographers can manage their own availability." on availability for all using ( auth.uid() = photographer_id );


-- -----------------------------------------------------------------------------
-- 5. SOCIAL FEED (Posts, Comments, Likes)
-- -----------------------------------------------------------------------------
create table posts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  content text not null,
  image_url text,
  likes_count integer default 0,
  comments_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table posts enable row level security;
create policy "Posts are viewable by everyone." on posts for select using ( true );
create policy "Users can create posts." on posts for insert with check ( auth.uid() = user_id );
create policy "Users can update their own posts." on posts for update using ( auth.uid() = user_id );
create policy "Users can delete their own posts." on posts for delete using ( auth.uid() = user_id );
create policy "Admins can delete posts." on posts for delete using ( exists ( select 1 from profiles where id = auth.uid() and role = 'admin' ) );

create table comments (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references posts(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  parent_id uuid references comments(id) on delete cascade,
  content text not null,
  likes_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table comments enable row level security;
create policy "Comments are viewable by everyone." on comments for select using ( true );
create policy "Users can create comments." on comments for insert with check ( auth.uid() = user_id );
create policy "Users can delete their own comments." on comments for delete using ( auth.uid() = user_id );

-- Comment Likes
create table comment_likes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) not null,
  comment_id uuid references comments(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, comment_id)
);
alter table comment_likes enable row level security;
create policy "Comment likes are viewable by everyone." on comment_likes for select using ( true );
create policy "Users can create comment likes." on comment_likes for insert with check ( auth.uid() = user_id );
create policy "Users can delete their own comment likes." on comment_likes for delete using ( auth.uid() = user_id );

-- Post Likes
create table likes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) not null,
  post_id uuid references posts(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, post_id)
);
alter table likes enable row level security;
create policy "Likes are viewable by everyone." on likes for select using ( true );
create policy "Users can create likes." on likes for insert with check ( auth.uid() = user_id );
create policy "Users can delete their own likes." on likes for delete using ( auth.uid() = user_id );

-- Triggers for counts (Posts, Comments)
create or replace function update_post_likes_count() returns trigger as $$
begin
  if (TG_OP = 'INSERT') then
    update posts set likes_count = likes_count + 1 where id = new.post_id;
  elsif (TG_OP = 'DELETE') then
    update posts set likes_count = likes_count - 1 where id = old.post_id;
  end if;
  return null;
end;
$$ language plpgsql;

create trigger trigger_update_post_likes_count after insert or delete on likes for each row execute procedure update_post_likes_count();

create or replace function update_post_comments_count() returns trigger as $$
begin
  if (TG_OP = 'INSERT') then
    update posts set comments_count = comments_count + 1 where id = new.post_id;
  elsif (TG_OP = 'DELETE') then
    update posts set comments_count = comments_count - 1 where id = old.post_id;
  end if;
  return null;
end;
$$ language plpgsql;

create trigger trigger_update_post_comments_count after insert or delete on comments for each row execute procedure update_post_comments_count();

create or replace function update_comment_likes_count() returns trigger as $$
begin
  if (TG_OP = 'INSERT') then
    update comments set likes_count = likes_count + 1 where id = new.comment_id;
  elsif (TG_OP = 'DELETE') then
    update comments set likes_count = likes_count - 1 where id = old.comment_id;
  end if;
  return null;
end;
$$ language plpgsql;

create trigger trigger_update_comment_likes_count after insert or delete on comment_likes for each row execute procedure update_comment_likes_count();


-- -----------------------------------------------------------------------------
-- 6. REVIEWS
-- -----------------------------------------------------------------------------
create table reviews (
  id uuid default uuid_generate_v4() primary key,
  booking_id uuid references bookings(id) not null,
  photographer_id uuid references profiles(id) not null,
  customer_id uuid references profiles(id) not null,
  rating integer check (rating >= 1 and rating <= 5) not null,
  content text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(booking_id) 
);

alter table reviews enable row level security;
create policy "Reviews are viewable by everyone." on reviews for select using ( true );
create policy "Customers can create reviews for their completed bookings."
  on reviews for insert with check (
    auth.uid() = customer_id and exists (
      select 1 from bookings where id = booking_id and customer_id = auth.uid() and status = 'completed'
    )
  );

create or replace function get_average_rating(photographer_uuid uuid)
returns numeric as $$
begin
  return (select coalesce(avg(rating), 0) from reviews where photographer_id = photographer_uuid);
end;
$$ language plpgsql stable;


-- -----------------------------------------------------------------------------
-- 7. MESSAGING & REALTIME
-- -----------------------------------------------------------------------------
create table messages (
  id uuid default uuid_generate_v4() primary key,
  sender_id uuid references profiles(id) not null,
  receiver_id uuid references profiles(id) not null,
  content text not null,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table messages enable row level security;
create policy "Users can view their own messages." on messages for select using ( auth.uid() = sender_id or auth.uid() = receiver_id );
create policy "Users can send messages." on messages for insert with check ( auth.uid() = sender_id );

-- Enable Realtime
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime for table messages, profiles;
commit;
