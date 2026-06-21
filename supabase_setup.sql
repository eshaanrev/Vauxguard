create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  tier text default 'free',
  analyses_used integer default 0,
  updated_at timestamp with time zone default now()
);
alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create function public.handle_new_user() returns trigger as $$ begin insert into public.profiles (id, email) values (new.id, new.email); return new; end; $$ language plpgsql security definer;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
