BEGIN;

-- Step 1: Delete all existing compositions to start fresh.
DELETE FROM public.blend_compositions;

-- Step 2: Reset all descriptive data for existing blends.
UPDATE public.blends
SET 
  name_ar = 'توليفة ' || code,
  name_en = 'Blend ' || code,
  notes_ar = NULL,
  notes_en = NULL,
  preparation_notes_ar = NULL,
  preparation_notes_en = NULL,
  sensory_profile = '{}'::jsonb;

COMMIT;