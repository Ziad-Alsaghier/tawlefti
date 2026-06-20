-- Drop existing constraints if they exist, to prevent errors.
ALTER TABLE public.blend_compositions
DROP CONSTRAINT IF EXISTS blend_compositions_blend_id_fkey;

ALTER TABLE public.blend_compositions
DROP CONSTRAINT IF EXISTS blend_compositions_coffee_type_id_fkey;

-- Add the formal relationship between blend compositions and the blends table.
-- This tells the database that 'blend_id' refers to an actual blend.
ALTER TABLE public.blend_compositions
ADD CONSTRAINT blend_compositions_blend_id_fkey
FOREIGN KEY (blend_id) REFERENCES public.blends(id) ON DELETE CASCADE;

-- Add the formal relationship between blend compositions and the coffee types table.
-- This is the crucial step for the app to fetch coffee type names.
ALTER TABLE public.blend_compositions
ADD CONSTRAINT blend_compositions_coffee_type_id_fkey
FOREIGN KEY (coffee_type_id) REFERENCES public.coffee_types(id) ON DELETE CASCADE;