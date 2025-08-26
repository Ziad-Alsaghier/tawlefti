-- Step 1: Clear the old data from the main blend_compositions table again.
TRUNCATE TABLE public.blend_compositions RESTART IDENTITY;

-- Step 2: Insert the new data, this time cleaning the codes (trimming whitespace and converting to uppercase) to ensure a robust match.
INSERT INTO public.blend_compositions (blend_id, coffee_type_id, percentage)
SELECT 
    b.id AS blend_id,
    ct.id AS coffee_type_id,
    tbc.percentage
FROM 
    public.temp_blend_compositions tbc
JOIN 
    public.blends b ON TRIM(UPPER(tbc.blend_code)) = TRIM(UPPER(b.code))
JOIN 
    public.coffee_types ct ON TRIM(UPPER(tbc.coffee_type_code)) = TRIM(UPPER(ct.code));