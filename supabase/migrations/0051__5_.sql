DELETE FROM blend_compositions WHERE blend_id IN (
    SELECT id FROM blends WHERE code IN (SELECT DISTINCT blend_code FROM temp_full_blends)
);