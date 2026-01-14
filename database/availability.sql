-- Availability Table
create table availability (
  id uuid default uuid_generate_v4() primary key,
  photographer_id uuid references profiles(id) not null,
  unav_date date not null, -- Unavailable date
  reason text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(photographer_id, unav_date)
);

alter table availability enable row level security;

create policy "Availability is viewable by everyone."
  on availability for select
  using ( true );

create policy "Photographers can manage their own availability."
  on availability for all
  using ( auth.uid() = photographer_id );
