INSERT INTO temp_blend_compositions (blend_code, coffee_type_id, percentage)
SELECT
    t_full.blend_code,
    ct.id AS coffee_type_id,
    t_full.percentage
FROM
    temp_full_blends AS t_full
JOIN
    public.coffee_types AS ct ON t_full.coffee_name = ct.name_ar;