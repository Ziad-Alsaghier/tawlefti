INSERT INTO blend_compositions (blend_id, coffee_type_id, percentage)
SELECT 
    b.id,
    c.id,
    t.percentage
FROM 
    temp_turkish_blends t
JOIN 
    blends b ON b.code = t.blend_code
JOIN 
    coffee_types c ON c.code = t.coffee_type_code
ON CONFLICT (blend_id, coffee_type_id) 
DO UPDATE SET percentage = EXCLUDED.percentage;