-- Update the Check Constraint for Roles
-- First, we need to drop the existing constraint if it exists (names vary)
-- We will try to add a new one.

alter table profiles drop constraint if exists profiles_role_check;

alter table profiles 
add constraint profiles_role_check 
check (role in ('customer', 'photographer', 'admin'));

-- Function to promote a user to admin (for manual use in SQL editor)
create or replace function promote_to_admin(user_email text)
returns void as $$
declare
  target_user_id uuid;
begin
  select id into target_user_id from auth.users where email = user_email;
  
  if target_user_id is not null then
    update profiles set role = 'admin' where id = target_user_id;
    -- Also update metadata if needed, but profile role is our source of truth
  end if;
end;
$$ language plpgsql;

-- Admin capabilities policies
create policy "Admins can update any profile."
  on profiles for update
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can delete posts."
  on posts for delete
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );
