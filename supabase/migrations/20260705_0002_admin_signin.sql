-- M.O.T. PrintCore Academy — Administrator Sign-In hardening
-- Run AFTER 20260705_0001_academy.sql in Supabase SQL Editor.
-- This migration deliberately does NOT create a browser-based administrator registration path.

-- Browser users may read only their own profile through the existing RLS policy.
-- These privileges make the intent explicit: the browser cannot create, update or delete roles.
revoke insert, update, delete on table public.profiles from anon, authenticated;
grant select on table public.profiles to authenticated;

-- Confirm the security-definer role-check function uses the intended safe search path.
create or replace function public.is_academy_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- INITIAL ADMIN GRANT (run once by the project owner in Supabase SQL Editor only)
-- Replace the email below with the verified email used to sign in at admin-content.html.
-- update public.profiles
--    set role = 'admin'
--  where lower(email) = lower('YOUR_ADMIN_EMAIL@example.com');

-- Check the result before using the website:
-- select id, email, role from public.profiles order by created_at;
