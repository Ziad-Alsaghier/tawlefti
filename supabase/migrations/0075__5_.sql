-- أولاً: إدراج بيانات التوليفات المميزة في جدول `blends`
INSERT INTO public.blends (name_ar, name_en, code, notes_ar, notes_en, method_id, sensory_profile, roast_profile, is_active)
SELECT DISTINCT
    'توليفة ' || blend_code AS name_ar,
    'Blend ' || blend_code AS name_en,
    blend_code,
    notes AS notes_ar,
    notes AS notes_en, -- Placeholder for English notes
    'turkish' AS method_id,
    jsonb_build_object(
        'crema', crema,
        'body', body,
        'acidity', acidity,
        'bitterness', bitterness,
        'flavor', flavor,
        'aroma', 4 
    ) AS sensory_profile,
    roast_profile,
    true AS is_active
FROM
    temp_full_blends
ON CONFLICT (code) DO NOTHING;

-- ثانياً: ربط المكونات بالتوليفات التي تم إنشاؤها
INSERT INTO public.blend_compositions (blend_id, coffee_type_id, percentage)
SELECT
    b.id AS blend_id,
    t_comp.coffee_type_id,
    t_comp.percentage
FROM
    temp_blend_compositions AS t_comp
JOIN
    public.blends AS b ON t_comp.blend_code = b.code;