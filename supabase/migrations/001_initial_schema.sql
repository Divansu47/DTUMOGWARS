-- ============================================================
-- DTU MogWars - Complete Database Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE user_role AS ENUM ('student', 'admin');
CREATE TYPE profile_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE vote_value AS ENUM ('1', '-1');
CREATE TYPE notification_type AS ENUM ('vote', 'comment', 'rank_change', 'badge_earned', 'approved');

-- ============================================================
-- USERS TABLE (extends Supabase auth.users)
-- ============================================================
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'student',
  has_profile BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PROFILES TABLE
-- ============================================================
CREATE TABLE public.profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT NOT NULL,
  course TEXT NOT NULL,
  branch TEXT NOT NULL,
  year SMALLINT NOT NULL CHECK (year BETWEEN 1 AND 4),
  bio TEXT NOT NULL CHECK (char_length(bio) <= 500),
  avatar_url TEXT,
  cover_url TEXT,
  strength_tags TEXT[] NOT NULL DEFAULT '{}',
  instagram_url TEXT,
  linkedin_url TEXT,
  twitter_url TEXT,
  github_url TEXT,
  status profile_status NOT NULL DEFAULT 'pending',
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  admin_score_override INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- VOTES TABLE
-- ============================================================
CREATE TABLE public.votes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  voter_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  value SMALLINT NOT NULL CHECK (value IN (1, -1)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- One vote per user per profile
  UNIQUE (voter_id, profile_id)
);

-- ============================================================
-- COMMENTS TABLE
-- ============================================================
CREATE TABLE public.comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  author_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 500),
  is_hidden BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- RANKINGS TABLE (materialized for performance)
-- ============================================================
CREATE TABLE public.rankings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  score INTEGER NOT NULL DEFAULT 0,
  rank INTEGER NOT NULL DEFAULT 0,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- NOTIFICATIONS TABLE
-- ============================================================
CREATE TABLE public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  type notification_type NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_status ON public.profiles(status);
CREATE INDEX idx_profiles_branch ON public.profiles(branch);
CREATE INDEX idx_profiles_year ON public.profiles(year);
CREATE INDEX idx_votes_profile_id ON public.votes(profile_id);
CREATE INDEX idx_votes_voter_id ON public.votes(voter_id);
CREATE INDEX idx_comments_profile_id ON public.comments(profile_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_rankings_rank ON public.rankings(rank);
CREATE INDEX idx_rankings_score ON public.rankings(score DESC);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-create user record on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at();

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at();

-- Recompute rankings function
CREATE OR REPLACE FUNCTION public.recompute_rankings()
RETURNS VOID AS $$
BEGIN
  -- Delete and reinsert all rankings
  DELETE FROM public.rankings;
  
  INSERT INTO public.rankings (profile_id, score, rank, computed_at)
  SELECT
    p.id AS profile_id,
    COALESCE(
      -- Use admin override if set, otherwise compute from votes
      p.admin_score_override,
      COALESCE(SUM(v.value), 0)
    ) AS score,
    ROW_NUMBER() OVER (
      ORDER BY COALESCE(p.admin_score_override, COALESCE(SUM(v.value), 0)) DESC
    ) AS rank,
    NOW() AS computed_at
  FROM public.profiles p
  LEFT JOIN public.votes v ON v.profile_id = p.id
  WHERE p.status = 'approved' AND p.is_visible = TRUE
  GROUP BY p.id, p.admin_score_override;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger ranking recompute after vote
CREATE OR REPLACE FUNCTION public.trigger_ranking_update()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM public.recompute_rankings();
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_vote_change
  AFTER INSERT OR UPDATE OR DELETE ON public.votes
  FOR EACH STATEMENT EXECUTE PROCEDURE public.trigger_ranking_update();

-- Get profile with rank (helper view)
CREATE OR REPLACE VIEW public.profiles_with_rank AS
SELECT
  p.*,
  COALESCE(r.score, 0) AS vote_score,
  r.rank,
  COALESCE(COUNT(DISTINCT v.id)::INTEGER, 0) AS total_votes
FROM public.profiles p
LEFT JOIN public.rankings r ON r.profile_id = p.id
LEFT JOIN public.votes v ON v.profile_id = p.id
GROUP BY p.id, r.score, r.rank;

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- USERS policies
CREATE POLICY "Users can view all users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update own record" ON public.users FOR UPDATE USING (auth.uid() = id);

-- PROFILES policies
CREATE POLICY "Anyone can view approved profiles" ON public.profiles
  FOR SELECT USING (status = 'approved' AND is_visible = TRUE);

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can do everything on profiles" ON public.profiles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- VOTES policies
CREATE POLICY "Anyone can view votes" ON public.votes FOR SELECT USING (true);

CREATE POLICY "Authenticated users can vote" ON public.votes
  FOR INSERT WITH CHECK (
    auth.uid() = voter_id AND
    auth.uid() != (SELECT user_id FROM public.profiles WHERE id = profile_id)
  );

CREATE POLICY "Users can update own vote" ON public.votes
  FOR UPDATE USING (auth.uid() = voter_id);

CREATE POLICY "Users can delete own vote" ON public.votes
  FOR DELETE USING (auth.uid() = voter_id);

-- COMMENTS policies
CREATE POLICY "Anyone can view visible comments" ON public.comments
  FOR SELECT USING (is_hidden = FALSE);

CREATE POLICY "Users can view own comments" ON public.comments
  FOR SELECT USING (auth.uid() = author_id);

CREATE POLICY "Authenticated users can comment" ON public.comments
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can delete own comment" ON public.comments
  FOR DELETE USING (auth.uid() = author_id);

CREATE POLICY "Admins can manage all comments" ON public.comments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- RANKINGS policies
CREATE POLICY "Anyone can view rankings" ON public.rankings FOR SELECT USING (true);

CREATE POLICY "Admins can manage rankings" ON public.rankings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- NOTIFICATIONS policies
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- SEED ADMIN USER (update email below)
-- ============================================================
-- After running this schema, manually set a user as admin:
-- UPDATE public.users SET role = 'admin' WHERE email = 'your-admin@dtu.ac.in';
