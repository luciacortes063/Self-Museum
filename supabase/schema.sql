-- Run this entire file once in Supabase > SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  subtitle text not null default '',
  icon text not null default 'sparkles',
  theme text not null default 'enchanted-forest',
  filters text[] not null default '{}',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.exhibits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  room_id uuid not null references public.rooms(id) on delete cascade,
  title text not null,
  note text not null default '',
  category text,
  image_path text,
  x double precision not null default .5 check (x >= 0 and x <= 1),
  y double precision not null default .5 check (y >= 0 and y <= 1),
  scale double precision not null default 1,
  rotation double precision not null default 0,
  created_at timestamptz not null default now()
);

alter table public.rooms enable row level security;
alter table public.exhibits enable row level security;

drop policy if exists "rooms_select_own" on public.rooms;
drop policy if exists "rooms_insert_own" on public.rooms;
drop policy if exists "rooms_update_own" on public.rooms;
drop policy if exists "rooms_delete_own" on public.rooms;

create policy "rooms_select_own" on public.rooms for select using (auth.uid() = user_id);
create policy "rooms_insert_own" on public.rooms for insert with check (auth.uid() = user_id);
create policy "rooms_update_own" on public.rooms for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "rooms_delete_own" on public.rooms for delete using (auth.uid() = user_id);

drop policy if exists "exhibits_select_own" on public.exhibits;
drop policy if exists "exhibits_insert_own" on public.exhibits;
drop policy if exists "exhibits_update_own" on public.exhibits;
drop policy if exists "exhibits_delete_own" on public.exhibits;

create policy "exhibits_select_own" on public.exhibits for select using (auth.uid() = user_id);
create policy "exhibits_insert_own" on public.exhibits for insert with check (auth.uid() = user_id);
create policy "exhibits_update_own" on public.exhibits for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "exhibits_delete_own" on public.exhibits for delete using (auth.uid() = user_id);

-- Private image bucket.
insert into storage.buckets (id, name, public)
values ('museum-images', 'museum-images', false)
on conflict (id) do update set public = false;

drop policy if exists "museum_images_select_own" on storage.objects;
drop policy if exists "museum_images_insert_own" on storage.objects;
drop policy if exists "museum_images_update_own" on storage.objects;
drop policy if exists "museum_images_delete_own" on storage.objects;

-- Files are stored as USER_ID/ROOM_ID/FILE.
create policy "museum_images_select_own"
on storage.objects for select to authenticated
using (
  bucket_id = 'museum-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "museum_images_insert_own"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'museum-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "museum_images_update_own"
on storage.objects for update to authenticated
using (
  bucket_id = 'museum-images'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'museum-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "museum_images_delete_own"
on storage.objects for delete to authenticated
using (
  bucket_id = 'museum-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);
