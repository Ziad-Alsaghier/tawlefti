-- First, clear any existing composition data for Turkish coffee blends to prevent duplicates.
DELETE FROM public.blend_compositions
WHERE blend_id IN (SELECT id FROM public.blends WHERE method_id = 'turkish');

-- Now, populate the compositions table by matching codes from the temporary table.
INSERT INTO public.blend_compositions (blend_id, coffee_type_id, percentage)
SELECT
    b.id AS blend_id,
    ct.id AS coffee_type_id,
    tbc.percentage
FROM
    public.temp_blend_compositions AS tbc
JOIN
    public.blends AS b ON tbc.blend_code = b.code
JOIN
    public.coffee_types AS ct ON tbc.coffee_type_code = ct.code
WHERE
    b.method_id = 'turkish';