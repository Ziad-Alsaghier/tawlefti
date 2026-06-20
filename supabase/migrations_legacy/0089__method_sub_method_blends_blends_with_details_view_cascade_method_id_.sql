-- Step 1: Drop the old columns and any dependent objects (like views).
-- The CASCADE option is used to automatically remove the 'blends_with_details' view
-- which depends on these columns.
ALTER TABLE public.blends DROP COLUMN IF EXISTS method CASCADE;
ALTER TABLE public.blends DROP COLUMN IF EXISTS sub_method CASCADE;

-- Step 2: Add the new, structured column for the method ID.
ALTER TABLE public.blends ADD COLUMN IF NOT EXISTS method_id TEXT;