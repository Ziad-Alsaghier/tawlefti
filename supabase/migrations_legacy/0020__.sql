-- Check for blend codes in the temp table that don't exist in the main blends table
SELECT 'Blend Code Mismatch' AS error_type, tbc.blend_code AS mismatched_code
FROM public.temp_blend_compositions tbc
LEFT JOIN public.blends b ON tbc.blend_code = b.code
WHERE b.id IS NULL
GROUP BY tbc.blend_code

UNION ALL

-- Check for coffee type codes in the temp table that don't exist in the main coffee_types table
SELECT 'Coffee Type Code Mismatch' AS error_type, tbc.coffee_type_code AS mismatched_code
FROM public.temp_blend_compositions tbc
LEFT JOIN public.coffee_types ct ON tbc.coffee_type_code = ct.code
WHERE ct.id IS NULL
GROUP BY tbc.coffee_type_code;