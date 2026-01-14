-- SAFE UPDATE SCRIPT
-- Run this to update your EXISTING database without errors.

-- 1. Update Profiles Table (Add missing columns safeley)
DO $$ 
BEGIN 
    -- Add username
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'username') THEN
        ALTER TABLE profiles ADD COLUMN username text UNIQUE;
    END IF;

    -- Add cover_photo_url
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'cover_photo_url') THEN
        ALTER TABLE profiles ADD COLUMN cover_photo_url text;
    END IF;

    -- Add others...
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'website') THEN
        ALTER TABLE profiles ADD COLUMN website text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'social_links') THEN
        ALTER TABLE profiles ADD COLUMN social_links jsonb DEFAULT '{}';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'following_count') THEN
        ALTER TABLE profiles ADD COLUMN following_count integer DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'followers_count') THEN
        ALTER TABLE profiles ADD COLUMN followers_count integer DEFAULT 0;
    END IF;
END $$;

-- 2. Create Follows Table if it doesn't exist
CREATE TABLE IF NOT EXISTS follows (
  follower_id uuid REFERENCES profiles(id) NOT NULL,
  following_id uuid REFERENCES profiles(id) NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (follower_id, following_id)
);

-- Enable RLS on Follows
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- Safely create policies for Follows
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'follows' AND policyname = 'Follows are viewable by everyone') THEN
        CREATE POLICY "Follows are viewable by everyone" ON follows FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'follows' AND policyname = 'Users can follow others') THEN
        CREATE POLICY "Users can follow others" ON follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'follows' AND policyname = 'Users can unfollow') THEN
        CREATE POLICY "Users can unfollow" ON follows FOR DELETE USING (auth.uid() = follower_id);
    END IF;
END $$;

-- 3. Update Follow Counts Trigger (Safe to replace)
CREATE OR REPLACE FUNCTION update_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE profiles SET following_count = following_count + 1 WHERE id = NEW.follower_id;
    UPDATE profiles SET followers_count = followers_count + 1 WHERE id = NEW.following_id;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE profiles SET following_count = following_count - 1 WHERE id = OLD.follower_id;
    UPDATE profiles SET followers_count = followers_count - 1 WHERE id = OLD.following_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_follow_change ON follows;
CREATE TRIGGER on_follow_change
  AFTER INSERT OR DELETE ON follows
  FOR EACH ROW EXECUTE PROCEDURE update_follow_counts();

-- 4. Enable Realtime (Safe way)
BEGIN;
  -- Remove existing publication to avoid conflicts/errors, then recreate
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR TABLE messages, profiles;
COMMIT;
