-- الخطوة 1: التنظيف المسبق للبيانات القديمة
DO $$
DECLARE
    codes_to_delete TEXT[] := ARRAY['ESP-01', 'ESP-02', 'ESP-03', 'ESP-04', 'ESP-05'];
BEGIN
    DELETE FROM public.blend_compositions WHERE blend_id IN (SELECT id FROM public.blends WHERE code = ANY(codes_to_delete));
    DELETE FROM public.blends WHERE code = ANY(codes_to_delete);
END $$;

-- الخطوة 2: إنشاء الجداول المؤقتة
DROP TABLE IF EXISTS temp_raw_esp_blends;
DROP TABLE IF EXISTS temp_coffee_type_dictionary;
DROP TABLE IF EXISTS temp_parsed_blends;
DROP TABLE IF EXISTS temp_unified_esp_compositions;

CREATE TEMP TABLE temp_raw_esp_blends (line TEXT);
CREATE TEMP TABLE temp_coffee_type_dictionary (name_ar TEXT PRIMARY KEY, id UUID);
CREATE TEMP TABLE temp_parsed_blends (name_ar TEXT, code TEXT, composition_str TEXT, sensory_str TEXT);
CREATE TEMP TABLE temp_unified_esp_compositions (blend_code TEXT, coffee_type_id UUID, percentage INTEGER);

-- الخطوة 3: إدراج البيانات الخام وملء قاموس أنواع البن
INSERT INTO temp_raw_esp_blends (line) VALUES
('اسبريسو إيطاليانو (ESP-01) | 70% برازيلي, 30% روبوستا فيتنامي | 5, 5, 4, 4, 5'),
('اسبريسو كلاسيك (ESP-02) | 50% برازيلي, 30% كولومبي, 20% إثيوبي | 4, 4, 5, 3, 4'),
('اسبريسو مودرن (ESP-03) | 60% إثيوبي, 40% كولومبي | 4, 3, 5, 4, 4'),
('اسبريسو سبيشيال (ESP-04) | 100% كولومبي | 4, 4, 4, 4, 3'),
('اسبريسو ديليكاتو (ESP-05) | 70% كولومبي, 30% جواتيمالي | 3, 3, 5, 4, 3');

INSERT INTO temp_coffee_type_dictionary (name_ar, id)
SELECT name_ar, id FROM coffee_types WHERE is_active = true ON CONFLICT (name_ar) DO NOTHING;

-- الخطوة 4: تحليل البيانات الخام مرة واحدة وتخزينها في جدول منظم
INSERT INTO temp_parsed_blends (name_ar, code, composition_str, sensory_str)
SELECT
    trim(regexp_replace(split_part(line, ' | ', 1), '\\s*\\([^)]*\\)$', '')), -- استخلاص الاسم
    (regexp_matches(split_part(line, ' | ', 1), '\\(([^)]*)\\)'))[1], -- استخلاص الكود
    split_part(line, ' | ', 2), -- استخلاص سلسلة المكونات
    split_part(line, ' | ', 3)  -- استخلاص سلسلة المقاييس
FROM temp_raw_esp_blends;

-- الخطوة 5: توحيد بيانات المكونات وربطها
WITH normalized_composition AS (
    SELECT
        tp.code,
        trim(unnest(string_to_array(tp.composition_str, ','))) as component
    FROM temp_parsed_blends tp
)
INSERT INTO temp_unified_esp_compositions (blend_code, coffee_type_id, percentage)
SELECT
    nc.code,
    dict.id,
    (regexp_matches(nc.component, '(\d+)\%'))[1]::integer
FROM normalized_composition nc
JOIN temp_coffee_type_dictionary dict ON dict.name_ar = trim(regexp_replace(nc.component, '(\d+)\%', ''))
WHERE dict.id IS NOT NULL AND nc.code IS NOT NULL;

-- الخطوة 6: إنشاء التوليفات النهائية ومكوناتها
DO $$
DECLARE
    rec RECORD;
    new_blend_id UUID;
    sensory_array TEXT[];
    sensory_json JSONB;
BEGIN
    FOR rec IN SELECT * FROM temp_parsed_blends LOOP
        IF rec.code IS NULL THEN
            RAISE EXCEPTION 'فشل تحليل الكود للتوليفة: %', rec.name_ar;
        END IF;

        sensory_array := string_to_array(rec.sensory_str, ',');
        sensory_json := jsonb_build_object(
            'crema',       trim(sensory_array[1])::numeric,
            'body',        trim(sensory_array[2])::numeric,
            'balance',     trim(sensory_array[3])::numeric,
            'aftertaste',  trim(sensory_array[4])::numeric,
            'intensity',   trim(sensory_array[5])::numeric
        );

        INSERT INTO public.blends (name_ar, name_en, code, method_id, sensory_profile, is_active, notes_ar, notes_en)
        VALUES (
            rec.name_ar, 'Espresso Blend ' || rec.code, rec.code, 'espresso', sensory_json, true,
            'إيحاءات متوازنة تجمع بين حلاوة الشوكولاتة والمكسرات مع لمسة فاكهية خفيفة.',
            'Balanced notes combining chocolate and nuts sweetness with a light fruity touch.'
        ) RETURNING id INTO new_blend_id;

        INSERT INTO public.blend_compositions (blend_id, coffee_type_id, percentage)
        SELECT new_blend_id, tuc.coffee_type_id, tuc.percentage
        FROM temp_unified_esp_compositions tuc
        WHERE tuc.blend_code = rec.code;
    END LOOP;
END $$;

-- الخطوة 7: التنظيف النهائي
DROP TABLE temp_raw_esp_blends;
DROP TABLE temp_coffee_type_dictionary;
DROP TABLE temp_parsed_blends;
DROP TABLE temp_unified_esp_compositions;