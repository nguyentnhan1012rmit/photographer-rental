-- Reviews Table
create table reviews (
  id uuid default uuid_generate_v4() primary key,
  booking_id uuid references bookings(id) not null,
  photographer_id uuid references profiles(id) not null,
  customer_id uuid references profiles(id) not null,
  rating integer check (rating >= 1 and rating <= 5) not null,
  content text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(booking_id) -- One review per booking
);

alter table reviews enable row level security;

-- Policies
create policy "Reviews are viewable by everyone."
  on reviews for select
  using ( true );

create policy "Customers can create reviews for their completed bookings."
  on reviews for insert
  with check (
    auth.uid() = customer_id and exists (
      select 1 from bookings
      where id = booking_id
      and customer_id = auth.uid()
      and status = 'completed'
    )
  );

-- Function to calculate average rating
create or replace function get_average_rating(photographer_uuid uuid)
returns numeric as $$
begin
  return (
    select coalesce(avg(rating), 0)
    from reviews
    where photographer_id = photographer_uuid
  );
end;
$$ language plpgsql stable;
