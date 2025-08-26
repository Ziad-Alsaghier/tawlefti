-- Add admin_notes column to profiles table
ALTER TABLE public.profiles
ADD COLUMN admin_notes TEXT;

-- Add a comment for clarity
COMMENT ON COLUMN public.profiles.admin_notes IS 'Administrative notes for CRM purposes, only visible to admins.';