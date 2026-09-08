-- ============================================
-- NigaNime Supabase Database Schema
-- ============================================
-- Run this SQL in your Supabase SQL Editor:
-- https://supabase.com/dashboard → SQL Editor
-- ============================================

-- ============================================
-- 1. PROFILES TABLE
-- ============================================
-- Extends Supabase Auth users with display info
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Auto-create profile on user signup (safe against duplicate usernames & trigger errors)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
  counter INT := 0;
BEGIN
  -- Determine base username from metadata or email
  base_username := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data ->> 'name'), ''),
    NULLIF(TRIM(NEW.raw_user_meta_data ->> 'full_name'), ''),
    split_part(NEW.email, '@', 1),
    'user'
  );
  final_username := base_username;

  -- Ensure unique username if collision exists with another user
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username AND id != NEW.id) LOOP
    counter := counter + 1;
    final_username := base_username || '_' || counter;
  END LOOP;

  -- Upsert into public.profiles
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (
    NEW.id,
    final_username,
    COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', NULL)
  )
  ON CONFLICT (id) DO UPDATE
  SET
    username = EXCLUDED.username,
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
    updated_at = now();

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log warning to Supabase database logs but NEVER abort user signup in auth.users
    RAISE WARNING 'handle_new_user failed for user id %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Trigger: create profile after signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 2. FAVORITES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  anime_id TEXT NOT NULL,
  anime_title TEXT NOT NULL,
  anime_poster TEXT,
  anime_type TEXT,        -- TV, Movie, ONA, etc.
  anime_rating TEXT,      -- PG-13, R, etc.
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,

  -- Prevent duplicate favorites
  UNIQUE(user_id, anime_id)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_anime_id ON public.favorites(anime_id);

-- ============================================
-- 3. WATCH HISTORY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.watch_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  anime_id TEXT NOT NULL,
  anime_title TEXT NOT NULL,
  anime_poster TEXT,
  episode_id TEXT NOT NULL,
  episode_number INTEGER NOT NULL DEFAULT 1,
  playback_position REAL DEFAULT 0,      -- Last playback position in seconds
  duration REAL DEFAULT 0,               -- Total video duration in seconds
  watched_at TIMESTAMPTZ DEFAULT now() NOT NULL,

  -- One entry per user per episode (upsert on re-watch)
  UNIQUE(user_id, anime_id, episode_id)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_watch_history_user_id ON public.watch_history(user_id);
CREATE INDEX IF NOT EXISTS idx_watch_history_anime_id ON public.watch_history(user_id, anime_id);

-- ============================================
-- MIGRATION: Add playback_position column if upgrading existing database
-- Run this if your database was created before this update:
-- ============================================
-- ALTER TABLE public.watch_history ADD COLUMN IF NOT EXISTS playback_position REAL DEFAULT 0;
-- ALTER TABLE public.watch_history ADD COLUMN IF NOT EXISTS duration REAL DEFAULT 0;

-- ============================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ============================================
-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watch_history ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read all profiles, insert and edit their own
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Grant table permissions
GRANT ALL ON TABLE public.profiles TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE ON TABLE public.profiles TO authenticated;
GRANT SELECT ON TABLE public.profiles TO anon;

-- Favorites: users can CRUD only their own
CREATE POLICY "Users can view own favorites"
  ON public.favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites"
  ON public.favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
  ON public.favorites FOR DELETE
  USING (auth.uid() = user_id);

-- Watch History: users can CRUD only their own
CREATE POLICY "Users can view own watch history"
  ON public.watch_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own watch history"
  ON public.watch_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own watch history"
  ON public.watch_history FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own watch history"
  ON public.watch_history FOR DELETE
  USING (auth.uid() = user_id);
