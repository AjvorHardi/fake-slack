create extension if not exists pgcrypto;

create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  name varchar(32) not null,
  description varchar(120),
  is_default boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  constraint rooms_name_not_blank check (char_length(btrim(name)) between 1 and 32),
  constraint rooms_description_not_blank check (
    description is null or char_length(btrim(description)) between 1 and 120
  )
);

create unique index if not exists rooms_name_lower_idx on public.rooms ((lower(name)));
create unique index if not exists rooms_single_default_idx on public.rooms (is_default)
where is_default;

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  client_id uuid not null,
  nickname_snapshot varchar(24) not null,
  body varchar(1000) not null,
  created_at timestamptz not null default timezone('utc', now()),
  constraint messages_nickname_not_blank check (
    char_length(btrim(nickname_snapshot)) between 1 and 24
  ),
  constraint messages_body_not_blank check (char_length(btrim(body)) between 1 and 1000)
);

create index if not exists messages_room_id_created_at_idx
on public.messages (room_id, created_at desc, id desc);

grant usage on schema public to anon;
grant select, insert on public.rooms to anon;
grant select, insert on public.messages to anon;

alter table public.rooms enable row level security;
alter table public.messages enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'rooms'
      and policyname = 'rooms_public_select'
  ) then
    create policy rooms_public_select
      on public.rooms
      for select
      to anon
      using (true);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'rooms'
      and policyname = 'rooms_public_insert'
  ) then
    create policy rooms_public_insert
      on public.rooms
      for insert
      to anon
      with check (true);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'messages'
      and policyname = 'messages_public_select'
  ) then
    create policy messages_public_select
      on public.messages
      for select
      to anon
      using (true);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'messages'
      and policyname = 'messages_public_insert'
  ) then
    create policy messages_public_insert
      on public.messages
      for insert
      to anon
      with check (true);
  end if;
end $$;

do $$
begin
  if not exists (select 1 from public.rooms where is_default) then
    if exists (select 1 from public.rooms where lower(name) = 'general') then
      update public.rooms
      set is_default = true
      where lower(name) = 'general';
    else
      insert into public.rooms (name, description, is_default)
      values ('general', 'Default room for everyone', true);
    end if;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_publication
    where pubname = 'supabase_realtime'
  ) then
    create publication supabase_realtime;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_publication_rel pr
    join pg_publication p on p.oid = pr.prpubid
    join pg_class c on c.oid = pr.prrelid
    join pg_namespace n on n.oid = c.relnamespace
    where p.pubname = 'supabase_realtime'
      and n.nspname = 'public'
      and c.relname = 'rooms'
  ) then
    alter publication supabase_realtime add table public.rooms;
  end if;

  if not exists (
    select 1
    from pg_publication_rel pr
    join pg_publication p on p.oid = pr.prpubid
    join pg_class c on c.oid = pr.prrelid
    join pg_namespace n on n.oid = c.relnamespace
    where p.pubname = 'supabase_realtime'
      and n.nspname = 'public'
      and c.relname = 'messages'
  ) then
    alter publication supabase_realtime add table public.messages;
  end if;
end $$;
