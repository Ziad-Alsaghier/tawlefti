-- Step 1: Clear the old data from the main blend_compositions table to ensure a fresh start.
TRUNCATE TABLE public.blend_compositions RESTART IDENTITY;

-- Step 2: Insert the new, correctly linked data from the temporary table into the main table.
-- This joins the codes from the temp table with the actual IDs from the blends and coffee_types tables.
INSERT INTO public.blend_compositions (blend_id, coffee_type_id, percentage)
SELECT 
    b.id AS blend_id,
    ct.id AS coffee_type_id,
    tbc.percentage
FROM 
    public.temp_blend_compositions tbc
JOIN 
    public.blends b ON tbc.blend_code = b.code
JOIN 
    public.coffee_types ct ON tbc.coffee_type_code = ct.code;