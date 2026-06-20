-- Step 1: Temporarily allow the main ID columns to be empty
ALTER TABLE public.blend_compositions ALTER COLUMN blend_id DROP NOT NULL;
ALTER TABLE public.blend_compositions ALTER COLUMN coffee_type_id DROP NOT NULL;

-- Step 2: Add new columns with names that EXACTLY match your CSV file
ALTER TABLE public.blend_compositions ADD COLUMN blend_code TEXT;
ALTER TABLE public.blend_compositions ADD COLUMN coffee_type_code TEXT;