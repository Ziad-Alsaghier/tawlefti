UPDATE blends
SET sensory_profile = subquery.sensory_profile
FROM (
    SELECT DISTINCT ON (blend_code) 
        blend_code, 
        sensory_profile
    FROM temp_turkish_blends
) AS subquery
WHERE blends.code = subquery.blend_code AND blends.method_id = 'turkish';