INSERT INTO blends (code, name_ar, name_en, method_id, notes_ar, notes_en, roast_profile, sensory_profile, is_active)
SELECT DISTINCT
    blend_code,
    'توليفة ' || blend_code,
    'Blend ' || blend_code,
    'turkish',
    notes,
    notes,
    roast_profile,
    jsonb_build_object('crema', crema, 'body', body, 'acidity', acidity, 'bitterness', bitterness, 'flavor', flavor, 'aroma', 3),
    true
FROM temp_full_blends
ON CONFLICT (code) DO UPDATE SET
    notes_ar = EXCLUDED.notes_ar,
    notes_en = EXCLUDED.notes_en,
    roast_profile = EXCLUDED.roast_profile,
    sensory_profile = EXCLUDED.sensory_profile,
    is_active = true;