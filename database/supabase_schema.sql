-- Create a table for public profiles using Supabase Auth
create table profiles (
  id uuid references auth.users not null primary key,
  updated_at timestamp with time zone,
  full_name text,
  avatar_url text,
  role text check (role in ('customer', 'photographer')) default 'customer',
  bio text,
  location text
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Create a table for services offered by photographers
create table services (
  id uuid default uuid_generate_v4() primary key,
  photographer_id uuid references profiles(id) not null,
  title text not null,
  description text,
  price decimal(10, 2) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table services enable row level security;

create policy "Services are viewable by everyone."
  on services for select
  using ( true );

create policy "Photographers can insert their own services."
  on services for insert
  with check ( auth.uid() = photographer_id );

-- Create a table for portfolio items
create table portfolio_items (
  id uuid default uuid_generate_v4() primary key,
  photographer_id uuid references profiles(id) not null,
  image_url text not null,
  caption text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table portfolio_items enable row level security;

create policy "Portfolio items are viewable by everyone."
  on portfolio_items for select
  using ( true );

create policy "Photographers can manage their own portfolio."
  on portfolio_items for all
  using ( auth.uid() = photographer_id );

-- Create a table for bookings
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
  on bookings for select
  using ( auth.uid() = customer_id or auth.uid() = photographer_id );

create policy "Customers can create bookings."
  on bookings for insert
  with check ( auth.uid() = customer_id );

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

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
