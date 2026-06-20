ALTER TABLE public.blend_compositions
DROP COLUMN IF EXISTS blend_code,
DROP COLUMN IF EXISTS coffee_type_code,
DROP COLUMN IF EXISTS temp_blend_code;