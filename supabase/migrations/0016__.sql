-- Step 1: Link compositions to blends using the blend_code
UPDATE public.blend_compositions bc
SET blend_id = b.id
FROM public.blends b
WHERE bc.blend_code = b.code AND bc.blend_id IS NULL;

-- Step 2: Link compositions to coffee_types using the coffee_type_code
UPDATE public.blend_compositions bc
SET coffee_type_id = ct.id
FROM public.coffee_types ct
WHERE bc.coffee_type_code = ct.code AND bc.coffee_type_id IS NULL;