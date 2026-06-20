INSERT INTO temp_blend_compositions (blend_code, coffee_type_id, percentage)
SELECT
    t_full.blend_code,
    ct.id AS coffee_type_id,
    t_full.percentage
FROM
    temp_full_blends AS t_full
JOIN
    temp_name_mapping AS t_map ON t_full.coffee_name = t_map.file_name
JOIN
    public.coffee_types AS ct ON t_map.official_code = ct.code;