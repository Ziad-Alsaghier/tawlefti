ALTER TABLE public.blend_compositions DROP CONSTRAINT IF EXISTS blend_compositions_pkey;
ALTER TABLE public.blend_compositions DROP COLUMN IF EXISTS id;
ALTER TABLE public.blend_compositions ADD PRIMARY KEY (blend_code, coffee_type_code);

ALTER TABLE public.blend_compositions
ADD CONSTRAINT fk_blend_code
FOREIGN KEY (blend_code)
REFERENCES public.blends(code)
ON DELETE CASCADE;

ALTER TABLE public.blend_compositions
ADD CONSTRAINT fk_coffee_type_code
FOREIGN KEY (coffee_type_code)
REFERENCES public.coffee_types(code)
ON DELETE CASCADE;