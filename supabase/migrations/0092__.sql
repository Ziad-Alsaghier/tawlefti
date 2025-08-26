-- Add new columns for preparation notes to the blends table
ALTER TABLE public.blends ADD COLUMN IF NOT EXISTS preparation_notes_ar TEXT;
ALTER TABLE public.blends ADD COLUMN IF NOT EXISTS preparation_notes_en TEXT;