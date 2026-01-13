-- Fix specific foreign key to allow joining with profiles
alter table posts drop constraint if exists posts_user_id_fkey;
alter table posts add constraint posts_user_id_fkey foreign key (user_id) references public.profiles(id) on delete cascade;

-- Comments also need to reference profiles for the same reason if we want to show author
alter table comments drop constraint if exists comments_user_id_fkey;
alter table comments add constraint comments_user_id_fkey foreign key (user_id) references public.profiles(id) on delete cascade;
