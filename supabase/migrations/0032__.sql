UPDATE blends
SET sensory_profile = t.sensory_profile
FROM temp_turkish_blends t
WHERE blends.code = t.blend_code AND blends.method_id = 'turkish';