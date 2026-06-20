-- Step 1: Ensure all required coffee types exist.
-- This will insert them if they don't, and do nothing if they already exist.
INSERT INTO public.coffee_types (code, name_ar, name_en, is_active)
VALUES
    ('colombian', 'بن كولومبي', 'Colombian Coffee', true),
    ('brazil_santos', 'بن برازيلي سانتوس', 'Brazil Santos Coffee', true),
    ('guatemala', 'بن جواتيمالي', 'Guatemalan Coffee', true),
    ('india_robusta', 'بن هندي روبيستا', 'Indian Robusta Coffee', true),
    ('ugandan', 'بن أوغندي', 'Ugandan Coffee', true),
    ('yemen_khawlani', 'بن يمني خولاني', 'Yemeni Khawlani Coffee', true),
    ('ethiopian_harari', 'بن حبشي هراري', 'Ethiopian Harari Coffee', true),
    ('vietnamese', 'بن فيتنامي', 'Vietnamese Coffee', true),
    ('brazil_robusta', 'بن برازيلي روبيستا', 'Brazil Robusta Coffee', true),
    ('peruvian', 'بن بيروفي', 'Peruvian Coffee', true),
    ('india_mysore', 'بن هندي مايسور', 'Indian Mysore Coffee', true),
    ('ethiopian_lekmti', 'بن حبشي لقميتي', 'Ethiopian Lekempti Coffee', true),
    ('costa_rican', 'بن كوستاريكي', 'Costa Rican Coffee', true),
    ('indonesian', 'بن إندونيسي', 'Indonesian Coffee', true)
ON CONFLICT (code) DO NOTHING;

-- Step 2: Upsert the 10 functional blends
INSERT INTO public.blends (code, name_ar, name_en, notes_ar, preparation_notes_ar, display_category, is_active, method_id)
VALUES
    ('FUNC_TRKZ', 'تركيز', 'Focus', 'رائحة دافئة من التوابل، مع مذاق متوازن يجمع حلاوة الشوكولاتة والكراميل، ونهاية ترابية خفيفة من الجنسنج.', 'تحويجة خاصة (لكل كيلو بن): ١٥ جرام قرفة، ١٠ جرام هيل، ٥ جرام جوزة الطيب، ٥ جرام مسحوق الجنسنج.', 'وظيفية', true, null),
    ('FUNC_PWR', 'باور', 'Power', 'طعم قوي ولاذع، مع مرارة واضحة وركلة كافيين قوية، معززة بالإحساس الدافئ من الزنجبيل والقوة الترابية من الجنسنج.', 'تحويجة خاصة (لكل كيلو بن): ٢٠ جرام زنجبيل، ١٠ جرام قرنفل، ١٥ جرام مسحوق الجنسنج.', 'وظيفية', true, null),
    ('FUNC_SHGF', 'شغف', 'Passion', 'تجربة عطرية فاخرة، مع طعم معقد يجمع بين حلاوة التمر والزيبيب، ورائحة الورد والزعفران، معززة بنهاية دافئة وحيوية من الجنسنج.', 'تحويجة خاصة (لكل كيلو بن): ٢٠ جرام هيل فاخر، رشة زعفران، ٥ جرام بتلات ورد، ١٠ جرام مسحوق الجنسنج.', 'وظيفية', true, null),
    ('FUNC_BRKN', 'بركان', 'Volcano', 'قهوة قوية ذات كافيين عالٍ ونكهة خام.', 'تحويجة خاصة: ٢٠ جرام جذور الشيكوريا المحمصة (اختياري)، ١٠ جرام فلفل أسود مطحون.', 'وظيفية', true, null),
    ('FUNC_ESHRQ', 'إشراقة', 'Sunrise', 'قهوة صباحية متوازنة وكلاسيكية.', 'تحويجة خاصة: ١٥ جرام هيل، ٥ جرام مستكة (اختياري).', 'وظيفية', true, null),
    ('FUNC_HDM', 'هضم', 'Digest', 'قهوة مريحة للمعدة بعد الأكل.', 'تحويجة خاصة: ٢٠ جرام يانسون، ١٠ جرام بذور شمر.', 'وظيفية', true, null),
    ('FUNC_HDO', 'هدوء', 'Calm', 'كوب قهوة كريمي وناعم جداً، مع رائحة الفانيليا وجوزة الطيب المريحة للأعصاب.', 'تحويجة خاصة (لكل كيلو بن): ١٥ جرام فانيليا طبيعية، ٥ جرام بابونج (اختياري)، رشة خفيفة من جوزة الطيب.', 'وظيفية', true, null),
    ('FUNC_ELHM', 'إلهام', 'Inspire', 'قهوة ذات تعقيد فاكهي وتابلي مميز.', 'تحويجة خاصة: ١٥ جرام قشر برتقال مجفف، ٥ جرام يانسون نجمي مطحون.', 'وظيفية', true, null),
    ('FUNC_DWN', 'ديوان', 'Diwan', 'قهوة ضيافة فاخرة وكلاسيكية.', 'تحويجة خاصة: ٣٠ جرام هيل أخضر فاخر، خيط أو اثنين من الزعفران الأصلي.', 'وظيفية', true, null),
    ('FUNC_DFE', 'دفء', 'Warmth', 'مزيج شتوي كلاسيكي مع ثلاثية توابل دافئة.', 'تحويجة خاصة: ١٥ جرام قرفة، ١٠ جرام قرنفل، ٥ جرام جوزة الطيب.', 'وظيفية', true, null)
ON CONFLICT (code) DO UPDATE SET
    name_ar = EXCLUDED.name_ar,
    name_en = EXCLUDED.name_en,
    notes_ar = EXCLUDED.notes_ar,
    preparation_notes_ar = EXCLUDED.preparation_notes_ar,
    display_category = EXCLUDED.display_category,
    is_active = EXCLUDED.is_active,
    method_id = EXCLUDED.method_id;

-- Step 3: Clear existing compositions for these blends to avoid duplicates
DELETE FROM public.blend_compositions WHERE blend_code IN (
    'FUNC_TRKZ', 'FUNC_PWR', 'FUNC_SHGF', 'FUNC_BRKN', 'FUNC_ESHRQ', 'FUNC_HDM', 'FUNC_HDO', 'FUNC_ELHM', 'FUNC_DWN', 'FUNC_DFE'
);

-- Step 4: Insert new compositions
INSERT INTO public.blend_compositions (blend_code, coffee_type_code, percentage)
VALUES
    -- تركيز
    ('FUNC_TRKZ', 'colombian', 50),
    ('FUNC_TRKZ', 'brazil_santos', 30),
    ('FUNC_TRKZ', 'guatemala', 20),
    -- باور
    ('FUNC_PWR', 'india_robusta', 60),
    ('FUNC_PWR', 'ugandan', 40),
    -- شغف
    ('FUNC_SHGF', 'yemen_khawlani', 60),
    ('FUNC_SHGF', 'ethiopian_harari', 40),
    -- بركان
    ('FUNC_BRKN', 'vietnamese', 70),
    ('FUNC_BRKN', 'brazil_robusta', 30),
    -- إشراقة
    ('FUNC_ESHRQ', 'colombian', 60),
    ('FUNC_ESHRQ', 'guatemala', 40),
    -- هضم
    ('FUNC_HDM', 'peruvian', 70),
    ('FUNC_HDM', 'brazil_santos', 30),
    -- هدوء
    ('FUNC_HDO', 'brazil_santos', 80),
    ('FUNC_HDO', 'india_mysore', 20),
    -- إلهام
    ('FUNC_ELHM', 'ethiopian_lekmti', 70),
    ('FUNC_ELHM', 'costa_rican', 30),
    -- ديوان
    ('FUNC_DWN', 'yemen_khawlani', 80),
    ('FUNC_DWN', 'colombian', 20),
    -- دفء
    ('FUNC_DFE', 'indonesian', 60),
    ('FUNC_DFE', 'brazil_santos', 40);