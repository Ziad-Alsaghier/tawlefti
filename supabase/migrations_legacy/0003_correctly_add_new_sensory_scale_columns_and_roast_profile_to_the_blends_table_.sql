-- Drop the old JSONB column as it's being replaced by individual columns
ALTER TABLE public.blends DROP COLUMN IF EXISTS sensory_profile;

-- Add all the new sensory scale columns from your final file
ALTER TABLE public.blends ADD COLUMN IF NOT EXISTS crema NUMERIC;
ALTER TABLE public.blends ADD COLUMN IF NOT EXISTS body NUMERIC;
ALTER TABLE public.blends ADD COLUMN IF NOT EXISTS acidity NUMERIC;
ALTER TABLE public.blends ADD COLUMN IF NOT EXISTS bitterness NUMERIC;
ALTER TABLE public.blends ADD COLUMN IF NOT EXISTS flavor NUMERIC;
ALTER TABLE public.blends ADD COLUMN IF NOT EXISTS aroma NUMERIC;

-- Add the new roast profile column
ALTER TABLE public.blends ADD COLUMN IF NOT EXISTS roast_profile TEXT;

-- Ensure notes_en column exists (it should, but this is safe)
ALTER TABLE public.blends ADD COLUMN IF NOT EXISTS notes_en TEXT;