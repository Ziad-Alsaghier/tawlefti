DO $$
DECLARE
    -- Temporary tables for staging data from the Excel file
    -- This makes the import process safer and more manageable.
BEGIN
    -- Step 1: Create temporary tables to stage the data.
    CREATE TEMP TABLE temp_coffee_types (
        code TEXT PRIMARY KEY,
        name_ar TEXT,
        name_en TEXT,
        price_per_kg NUMERIC
    );

    CREATE TEMP TABLE temp_blends (
        method_id TEXT,
        code TEXT PRIMARY KEY,
        name_ar TEXT,
        name_en TEXT,
        composition_str TEXT,
        notes_ar TEXT,
        notes_en TEXT,
        sensory_scores TEXT -- e.g., "5,4,4,3,5"
    );

    -- Step 2: Populate temp_coffee_types with data from the Excel file.
    -- This represents the "أنواع البن والأسعار" sheet.
    INSERT INTO temp_coffee_types (code, name_ar, name_en, price_per_kg) VALUES
    ('BR-01', 'برازيلي', 'Brazilian', 350.00),
    ('CO-01', 'كولومبي', 'Colombian', 400.00),
    ('ET-01', 'إثيوبي', 'Ethiopian', 450.00),
    ('VN-R-01', 'روبوستا فيتنامي', 'Vietnamese Robusta', 250.00),
    ('GT-01', 'جواتيمالي', 'Guatemalan', 420.00),
    ('IN-R-01', 'روبوستا هندي', 'Indian Robusta', 260.00),
    ('BR-GR-01', 'برازيلي أخضر', 'Brazilian Green', 200.00);

    -- Step 3: Populate temp_blends with data from the Excel file.
    -- This represents the main "التوليفات" sheet.
    INSERT INTO temp_blends (method_id, code, name_ar, name_en, composition_str, notes_ar, notes_en, sensory_scores) VALUES
    -- Turkish Coffee
    ('turkish', 'TRK-01', 'تركي كلاسيك', 'Turkish Classic', '70% برازيلي, 30% كولومبي', 'وش غني، قوام ثقيل، مرارة متوازنة.', 'Rich foam, heavy body, balanced bitterness.', '5,5,4,3,5,5'),
    ('turkish', 'TRK-02', 'تركي بالتحويجة', 'Turkish with Spices', '80% برازيلي, 20% روبوستا هندي', 'نكهة قوية مع لمسة من الهيل.', 'Strong flavor with a hint of cardamom.', '4,5,3,3,5,4'),
    
    -- Espresso
    ('espresso', 'ESP-01', 'اسبريسو إيطاليانو', 'Italiano Espresso', '70% برازيلي, 30% روبوستا فيتنامي', 'كريمة كثيفة، قوام ممتلئ، مذاق كلاسيكي.', 'Thick crema, full body, classic taste.', '5,5,4,4,5'),
    ('espresso', 'ESP-02', 'اسبريسو مودرن', 'Modern Espresso', '60% إثيوبي, 40% كولومبي', 'حمضية فاكهية، قوام متوسط، تعقيد في النكهات.', 'Fruity acidity, medium body, complex flavors.', '4,3,5,4,4'),
    
    -- V60 (Filter)
    ('v60', 'V60-01', 'V60 ديلايت', 'V60 Delight', '100% إثيوبي', 'نقاء ووضوح، حمضية مشرقة، عطرية فواحة.', 'Clarity, bright acidity, aromatic.', '5,5,5,5,3'),
    ('v60', 'V60-02', 'V60 بالانس', 'V60 Balance', '70% كولومبي, 30% جواتيمالي', 'توازن بين الحلاوة والحمضية، قوام متوسط.', 'Balance of sweetness and acidity, medium body.', '4,4,4,4,4'),

    -- French Press (Immersion)
    ('french-press', 'FP-01', 'فرنش برس بولد', 'French Press Bold', '50% كولومبي, 50% جواتيمالي', 'قوام ممتلئ، نكهات غنية وعميقة.', 'Full body, rich and deep flavors.', '2,3,4,5,5'),

    -- Green Coffee
    ('boiling', 'GRN-01', 'جرين ديتوكس', 'Green Detox', '100% برازيلي أخضر', 'نكهة عشبية خفيفة، مناسب للباحثين عن الصحة.', 'Light herbal flavor, suitable for health seekers.', '4,3,4,4,3');

END $$;

-- Step 4: Upsert coffee types into the main public table.
-- This adds new types and updates existing ones without causing errors.
INSERT INTO public.coffee_types (code, name_ar, name_en, price_per_kg)
SELECT code, name_ar, name_en, price_per_kg FROM temp_coffee_types
ON CONFLICT (code) DO UPDATE SET
    name_ar = EXCLUDED.name_ar,
    name_en = EXCLUDED.name_en,
    price_per_kg = EXCLUDED.price_per_kg;

-- Step 5: Clean up old blend data before inserting new data.
-- We delete from the linking table first to avoid foreign key violations.
DELETE FROM public.blend_compositions WHERE blend_code IN (SELECT code FROM temp_blends);
DELETE FROM public.blends WHERE code IN (SELECT code FROM temp_blends);

-- Step 6: Process the staged data and insert it into the final tables.
DO $$
DECLARE
    rec RECORD;
    sensory_json JSONB;
    scores TEXT[];
    component_text TEXT;
    component_name TEXT;
    component_percentage INTEGER;
    coffee_type_code_val TEXT;
BEGIN
    FOR rec IN SELECT * FROM temp_blends LOOP
        scores := string_to_array(rec.sensory_scores, ',');
        
        -- Build the sensory_profile JSON based on the method_id
        IF rec.method_id = 'turkish' THEN
            sensory_json := jsonb_build_object('crema', scores[1]::numeric, 'body', scores[2]::numeric, 'acidity', scores[3]::numeric, 'bitterness', scores[4]::numeric, 'flavor', scores[5]::numeric, 'aroma', scores[6]::numeric);
        ELSIF rec.method_id = 'espresso' THEN
            sensory_json := jsonb_build_object('crema', scores[1]::numeric, 'body', scores[2]::numeric, 'balance', scores[3]::numeric, 'aftertaste', scores[4]::numeric, 'intensity', scores[5]::numeric);
        ELSIF rec.method_id = 'v60' THEN
            sensory_json := jsonb_build_object('clarity', scores[1]::numeric, 'acidity', scores[2]::numeric, 'aroma', scores[3]::numeric, 'complexity', scores[4]::numeric, 'body', scores[5]::numeric);
        ELSIF rec.method_id = 'french-press' THEN
            sensory_json := jsonb_build_object('clarity', scores[1]::numeric, 'acidity', scores[2]::numeric, 'aroma', scores[3]::numeric, 'complexity', scores[4]::numeric, 'body', scores[5]::numeric);
        ELSIF rec.method_id = 'boiling' THEN
            sensory_json := jsonb_build_object('bitterness', scores[1]::numeric, 'body', scores[2]::numeric, 'flavor', scores[3]::numeric, 'aroma', scores[4]::numeric, 'color', scores[5]::numeric);
        ELSE
            sensory_json := '{}'::jsonb;
        END IF;

        -- Insert the blend into the main 'blends' table
        INSERT INTO public.blends (code, name_ar, name_en, method_id, sensory_profile, notes_ar, notes_en, is_active)
        VALUES (rec.code, rec.name_ar, rec.name_en, rec.method_id, sensory_json, rec.notes_ar, rec.notes_en, true);

        -- Parse the composition string and insert into 'blend_compositions'
        FOR component_text IN SELECT trim(unnest(string_to_array(rec.composition_str, ','))) LOOP
            component_percentage := (regexp_matches(component_text, '(\d+)\%'))[1]::integer;
            component_name := trim(regexp_replace(component_text, '(\d+)\%', ''));

            -- Find the corresponding coffee type code
            SELECT code INTO coffee_type_code_val FROM public.coffee_types WHERE name_ar = component_name;

            IF coffee_type_code_val IS NOT NULL THEN
                INSERT INTO public.blend_compositions (blend_code, coffee_type_code, percentage)
                VALUES (rec.code, coffee_type_code_val, component_percentage);
            END IF;
        END LOOP;
    END LOOP;
END $$;

-- Step 7: Clean up by dropping the temporary tables.
DROP TABLE temp_coffee_types;
DROP TABLE temp_blends;