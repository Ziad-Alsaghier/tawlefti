-- Add foreign key constraint for blends if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'blend_compositions_blend_id_fkey' AND conrelid = 'public.blend_compositions'::regclass
  ) THEN
    ALTER TABLE public.blend_compositions
    ADD CONSTRAINT blend_compositions_blend_id_fkey
    FOREIGN KEY (blend_id)
    REFERENCES public.blends(id)
    ON DELETE CASCADE;
  END IF;
END;
$$;

-- Add foreign key constraint for coffee_types if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'blend_compositions_coffee_type_id_fkey' AND conrelid = 'public.blend_compositions'::regclass
  ) THEN
    ALTER TABLE public.blend_compositions
    ADD CONSTRAINT blend_compositions_coffee_type_id_fkey
    FOREIGN KEY (coffee_type_id)
    REFERENCES public.coffee_types(id)
    ON DELETE CASCADE;
  END IF;
END;
$$;