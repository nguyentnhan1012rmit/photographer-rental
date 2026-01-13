-- Create a table for posts (social feed)
create table posts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  content text not null,
  image_url text,
  likes_count integer default 0,
  comments_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table posts enable row level security;

create policy "Posts are viewable by everyone."
  on posts for select
  using ( true );

create policy "Users can create posts."
  on posts for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own posts."
  on posts for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own posts."
  on posts for delete
  using ( auth.uid() = user_id );

-- Create a table for comments
create table comments (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references posts(id) on delete cascade not null,
  user_id uuid references auth.users not null,
  parent_id uuid references comments(id) on delete cascade, -- For replies
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table comments enable row level security;

create policy "Comments are viewable by everyone."
  on comments for select
  using ( true );

create policy "Users can create comments."
  on comments for insert
  with check ( auth.uid() = user_id );

create policy "Users can delete their own comments."
  on comments for delete
  using ( auth.uid() = user_id );

-- Create a table for likes (polymorphic-ish, but simple for now)
create table likes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  post_id uuid references posts(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, post_id) -- Prevent duplicate likes
);

alter table likes enable row level security;

create policy "Likes are viewable by everyone."
  on likes for select
  using ( true );

create policy "Users can create likes."
  on likes for insert
  with check ( auth.uid() = user_id );

create policy "Users can delete their own likes."
  on likes for delete
  using ( auth.uid() = user_id );

-- Functions to update counts automatically
create or replace function update_post_likes_count()
returns trigger as $$
begin
  if (TG_OP = 'INSERT') then
    update posts set likes_count = likes_count + 1 where id = new.post_id;
  elsif (TG_OP = 'DELETE') then
    update posts set likes_count = likes_count - 1 where id = old.post_id;
  end if;
  return null;
end;
$$ language plpgsql;

create trigger trigger_update_post_likes_count
after insert or delete on likes
for each row execute procedure update_post_likes_count();

create or replace function update_post_comments_count()
returns trigger as $$
begin
  if (TG_OP = 'INSERT') then
    update posts set comments_count = comments_count + 1 where id = new.post_id;
  elsif (TG_OP = 'DELETE') then
    update posts set comments_count = comments_count - 1 where id = old.post_id;
  end if;
  return null;
end;
$$ language plpgsql;

create trigger trigger_update_post_comments_count
after insert or delete on comments
for each row execute procedure update_post_comments_count();
