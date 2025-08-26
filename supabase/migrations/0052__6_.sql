INSERT INTO blend_compositions (blend_id, coffee_type_id, percentage)
SELECT
    b.id,
    ct.id,
    tfb.percentage
FROM temp_full_blends tfb
JOIN blends b ON b.code = tfb.blend_code
JOIN coffee_types ct ON ct.name_ar = tfb.coffee_name;