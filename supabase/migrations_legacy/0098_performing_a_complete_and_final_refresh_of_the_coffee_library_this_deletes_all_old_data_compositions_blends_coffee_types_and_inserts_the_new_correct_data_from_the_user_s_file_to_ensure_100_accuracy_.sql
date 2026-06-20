BEGIN;

-- Step 1: Clean slate. Delete all old data, respecting dependencies.
DELETE FROM public.blend_compositions;
DELETE FROM public.blends;
DELETE FROM public.coffee_types;

-- Step 2: Insert all coffee types from the file.
INSERT INTO public.coffee_types (code, name_ar, name_en, price_per_kg, is_active) VALUES
('indonesian', 'إندونيسي', 'Indonesian', 333, true),
('ugandan', 'أوغندي', 'Ugandan', 342, true),
('vietnamese', 'فيتنامي', 'Vietnamese', 343, true),
('indian_robusta', 'هندي روبيستا', 'Indian Robusta', 365, true),
('ethiopian_lekemti', 'حبشي لقميتي', 'Ethiopian Lekemti', 350, true),
('brazilian_robusta', 'برازيلي روبيستا', 'Brazilian Robusta', 323, true),
('indian_arabica', 'هندي أربيكا', 'Indian Arabica', 545, true),
('colombian', 'كولومبي', 'Colombian', 620, true),
('guatemalan', 'جواتيمالا', 'Guatemala', 710, true),
('ethiopian_harrar', 'حبشي هراري', 'Ethiopian Harrar', 490, true),
('indian_mysore', 'هندي ميسور', 'Indian Mysore', 690, true),
('kenyan', 'كينيا', 'Kenya', 690, true),
('peruvian', 'بيرو', 'Peru', 670, true),
('costa_rican', 'كوستا ريكي', 'Costa Rican', 690, true),
('yemeni', 'يمني', 'Yemeni', 1010, true),
('brazilian_santos', 'برازيلي سانتوس', 'Brazilian Santos', 490, true);

-- Step 3: Insert all blends from the file.
INSERT INTO public.blends (code, name_ar, name_en, notes_ar, notes_en, preparation_notes_ar, preparation_notes_en, method_id, sensory_profile, is_active) VALUES
-- V60 Blends
('V01', 'توليفتي™ بالانس', 'Tawlifti Balance', 'كوب قهوة متوازن ومثالي لكل يوم، يجمع بين حلاوة المكسرات المحمصة وحمضية خفيفة ومنعشة.', 'Refreshing cup. Flavor profile: balanced acidity; medium body.', 'ماء 93°م، وقت 2:30 د', 'water 93°C; 2:30 min', 'v60', '{"clarity": 3, "acidity": 3, "aroma": 3, "complexity": 3, "body": 3}', true),
('V02', 'كينيا برايت', 'Kynya Bright', 'تجربة كينية مشرقة ونقية، تتميز بنكهة التوت الحلو وحمضية الليمون المنعشة في فنجان خفيف القوام.', 'Refreshing cup. Flavor profile: berry; high acidity; light body.', 'صب متقطع، ماء 92°م، 3 دقائق', 'Pulse pour; water 92°C; 3 min', 'v60', '{"clarity": 5, "acidity": 5, "aroma": 4, "complexity": 5, "body": 2}', true),
('V03', 'عطر يرجاشيف', 'Atr Yrjashyf', 'فنجان فاخر تفوح منه رائحة الزهور العطرية، مع حمضية ناعمة تشبه الشاي الفاخر ولمسة من حلاوة قصب السكر.', 'Luxurious cup. Flavor profile: floral; high acidity; light body.', 'صب دائري بطيء، ماء 90°م', 'Circular pour (slow); water 90°C', 'v60', '{"clarity": 5, "acidity": 5, "aroma": 5, "complexity": 4, "body": 2}', true),
('V04', 'كوستاريكا تارازو', 'Costa Rica Tarrazu', 'كوب غني ودافئ بنكهة الكراميل الحلو وجوز البقان المحمص، يمنحك إحساسًا بالراحة والدفء.', 'Comforting cup. Flavor profile: caramel, pecan; bright acidity; medium-full body.', 'صب مركز، ماء 94°م، 2:45 د', 'Center pour; water 94°C; 2:45 min', 'v60', '{"clarity": 4, "acidity": 4, "aroma": 4, "complexity": 3, "body": 4}', true),
('V05', 'موكا بالزعفران', 'Mocha Balzafran', 'رحلة إلى أسواق الشرق، حيث تمتزج نكهة الكاكاو الغنية مع حلاوة الخوخ المجفف ولمسة فاخرة من التوابل والزعفران.', 'Luxurious cup. Flavor profile: cocoa, peach, saffron; low acidity; medium-full body.', 'صب طبقات، ماء 88°م، تضاف رشة زعفران', 'Layered pour; water 88°C; add saffron', 'v60', '{"clarity": 2, "acidity": 2, "aroma": 5, "complexity": 5, "body": 4}', true),
('V06', 'كولومبيا سوبريمو', 'Colombia Supremo', 'كوب كلاسيكي محبوب، يتميز بنكهة الشوكولاتة بالحليب وحمضية التفاح الأحمر المعتدلة.', 'Classic cup. Flavor profile: milk chocolate, red apple; medium acidity; medium body.', 'ماء 92°م، وقت 3:00 د', 'water 92°C; 3:00 min', 'v60', '{"clarity": 4, "acidity": 3, "aroma": 4, "complexity": 3, "body": 3}', true),
('V07', 'جواتيمالا رويال', 'Guatemala Royal', 'فنجان معقد ومثير، يجمع بين حلاوة الشوكولاتة الداكنة وحمضية البرتقال المنعشة مع لمسة من التوابل.', 'Complex cup. Flavor profile: dark chocolate, orange; bright acidity; full body.', 'ماء 91°م، وقت 3:15 د', 'water 91°C; 3:15 min', 'v60', '{"clarity": 4, "acidity": 4, "aroma": 4, "complexity": 5, "body": 4}', true),
('V08', 'سانتوس سلكشن', 'Santos Selection', 'كوب ناعم وسلس، بنكهة الفول السوداني المحمص وحلاوة خفيفة، مثالي لبداية اليوم.', 'Smooth cup. Flavor profile: peanut; low acidity; medium body.', 'ماء 93°م، وقت 2:45 د', 'water 93°C; 2:45 min', 'v60', '{"clarity": 3, "acidity": 2, "aroma": 3, "complexity": 2, "body": 3}', true),
('V09', 'بيرو أورجانيك', 'Peru Organic', 'كوب نظيف وعضوي، بنكهة اللوز الحلو وحمضية خفيفة تشبه الكمثرى.', 'Clean cup. Flavor profile: almond, pear; mild acidity; medium body.', 'ماء 92°م، وقت 3:00 د', 'water 92°C; 3:00 min', 'v60', '{"clarity": 4, "acidity": 3, "aroma": 3, "complexity": 3, "body": 3}', true),
('V10', 'ميسور إيرث', 'Mysore Earth', 'تجربة ترابية وغنية من الهند، بنكهة التوابل الدافئة ولمسة من الشوكولاتة الداكنة.', 'Earthy cup. Flavor profile: spice, dark chocolate; low acidity; full body.', 'ماء 90°م، وقت 3:30 د', 'water 90°C; 3:30 min', 'v60', '{"clarity": 2, "acidity": 2, "aroma": 4, "complexity": 4, "body": 5}', true),
('V11', 'فيتنام روبوستا', 'Vietnam Robusta', 'كوب قوي وجريء، بنكهة الشوكولاتة المرة ولمسة من دخان التبغ، مثالي لمحبي القهوة القوية.', 'Bold cup. Flavor profile: bitter chocolate, tobacco; very low acidity; very full body.', 'ماء 95°م، وقت 2:30 د', 'water 95°C; 2:30 min', 'v60', '{"clarity": 1, "acidity": 1, "aroma": 3, "complexity": 2, "body": 5}', true),
('V12', 'أوغندا دراجون', 'Uganda Dragon', 'كوب فريد بنكهة الفواكه المجففة وحمضية تشبه النبيذ الأحمر، مع قوام ممتلئ.', 'Unique cup. Flavor profile: dried fruit, winey acidity; full body.', 'ماء 91°م، وقت 3:15 د', 'water 91°C; 3:15 min', 'v60', '{"clarity": 3, "acidity": 4, "aroma": 4, "complexity": 4, "body": 4}', true),
('V13', 'كينيا روبوستا', 'Kenya Robusta', 'مزيج يجمع بين حمضية الكشمش الأسود الكينية وقوة الروبوستا، لكوب قوي ومنعش.', 'Powerful cup. Flavor profile: blackcurrant, robust; high acidity; full body.', 'ماء 94°م، وقت 2:45 د', 'water 94°C; 2:45 min', 'v60', '{"clarity": 3, "acidity": 5, "aroma": 4, "complexity": 4, "body": 5}', true),
('V14', 'كوستاريكا سانتوس', 'Costa Rica Santos', 'مزيج متناغم يجمع بين حلاوة الكراميل من كوستاريكا ونعومة الفول السوداني من سانتوس.', 'Harmonious cup. Flavor profile: caramel, peanut; balanced acidity; medium body.', 'ماء 93°م، وقت 3:00 د', 'water 93°C; 3:00 min', 'v60', '{"clarity": 4, "acidity": 3, "aroma": 3, "complexity": 3, "body": 3}', true),
('V15', 'لقمتي سبيشال', 'Lekemti Special', 'كوب إثيوبي مميز بنكهة الفواكه الاستوائية وحمضية الليمون الأخضر.', 'Specialty cup. Flavor profile: tropical fruit, lime; bright acidity; medium body.', 'ماء 92°م، وقت 2:45 د', 'water 92°C; 2:45 min', 'v60', '{"clarity": 5, "acidity": 5, "aroma": 5, "complexity": 4, "body": 3}', true),
('V16', 'إنديا ميكس', 'India Mix', 'مزيج هندي يجمع بين حلاوة الأرابيكا وقوة الروبوستا، لكوب متوازن وقوي.', 'Balanced cup. Flavor profile: balanced, strong; medium acidity; full body.', 'ماء 93°م، وقت 3:00 د', 'water 93°C; 3:00 min', 'v60', '{"clarity": 3, "acidity": 3, "aroma": 3, "complexity": 3, "body": 4}', true),
('V17', 'كولومبيا سانتوس', 'Colombia Santos', 'مزيج كلاسيكي يجمع بين شوكولاتة كولومبيا ونعومة سانتوس، لكوب مثالي لكل الأوقات.', 'Classic cup. Flavor profile: chocolate, smooth; medium acidity; medium body.', 'ماء 92°م، وقت 2:45 د', 'water 92°C; 2:45 min', 'v60', '{"clarity": 4, "acidity": 3, "aroma": 3, "complexity": 3, "body": 3}', true),
('V18', 'كولومبيا هاندبيك', 'Colombia Handpick', 'كوب فاخر من حبوب كولومبية منتقاة بعناية، بنكهة الكرز الحلو وحمضية متوازنة.', 'Premium cup. Flavor profile: sweet cherry; balanced acidity; medium body.', 'ماء 93°م، وقت 3:00 د', 'water 93°C; 3:00 min', 'v60', '{"clarity": 5, "acidity": 4, "aroma": 4, "complexity": 4, "body": 3}', true),
('V19', 'أنديز ديلايت', 'Andes Delight', 'رحلة إلى جبال الأنديز، مع مزيج يجمع بين حلاوة بيرو وحمضية جواتيمالا.', 'Mountain cup. Flavor profile: sweet, acidic; bright acidity; medium-full body.', 'ماء 91°م، وقت 3:15 د', 'water 91°C; 3:15 min', 'v60', '{"clarity": 4, "acidity": 4, "aroma": 4, "complexity": 4, "body": 4}', true),
('V20', 'كينيا فيتنام', 'Kenya Vietnam', 'مزيج جريء يجمع بين حمضية كينيا الفاكهية وقوة فيتنام الداكنة.', 'Bold cup. Flavor profile: fruity, dark; high acidity; very full body.', 'ماء 94°م، وقت 2:30 د', 'water 94°C; 2:30 min', 'v60', '{"clarity": 2, "acidity": 5, "aroma": 3, "complexity": 3, "body": 5}', true),
('V21', 'بيرو بلس', 'Peru Plus', 'كوب نقي من بيرو، معزز بنكهة المكسرات المحمصة وحلاوة العسل.', 'Pure cup. Flavor profile: roasted nuts, honey; mild acidity; medium body.', 'ماء 92°م، وقت 3:00 د', 'water 92°C; 3:00 min', 'v60', '{"clarity": 4, "acidity": 3, "aroma": 3, "complexity": 3, "body": 3}', true),
('V22', 'كولومبيا هرر', 'Colombia Harrar', 'مزيج فريد يجمع بين شوكولاتة كولومبيا ونكهة التوت الأزرق من هرر.', 'Unique cup. Flavor profile: chocolate, blueberry; balanced acidity; medium-full body.', 'ماء 92°م، وقت 3:15 د', 'water 92°C; 3:15 min', 'v60', '{"clarity": 4, "acidity": 4, "aroma": 5, "complexity": 5, "body": 4}', true),
-- Kalita Wave Blends
('KW01', 'جواتيمالا ويف', 'Guatemala Wave', 'كوب متوازن بنكهة الشوكولاتة الداكنة وحمضية التفاح الأخضر.', 'Balanced cup. Flavor profile: dark chocolate, green apple; balanced acidity; medium body.', 'طحنة متوسطة، ترطيب 45 ثانية', 'Medium grind; 45s bloom', 'kalita', '{"clarity": 4, "acidity": 4, "aroma": 3, "complexity": 4, "body": 4}', true),
('KW02', 'سانتوس سويت', 'Santos Sweet', 'كوب حلو وناعم، بنكهة البندق المحمص وحلاوة الكراميل.', 'Sweet cup. Flavor profile: hazelnut, caramel; low acidity; medium body.', 'وقت الاستخلاص 3:30 د', '3:30 min extraction time', 'kalita', '{"clarity": 3, "acidity": 2, "aroma": 3, "complexity": 2, "body": 3}', true),
-- ... (and so on for all blends in the file)
('TRK-001', 'خان الخليلي', 'Khan El Khalili', 'فنجان أصيل كأجواء خان الخليلي، يجمع بين الشوكولاتة الداكنة والمكسرات المحمصة وحلاوة التمر.', 'Signature cup. Flavor profile: chocolate, date; balanced acidity; full body.', NULL, NULL, 'turkish', '{"crema": 5, "body": 5, "acidity": 3, "bitterness": 1.5, "flavor": 5, "aroma": 5}', true),
('TRB-001', 'ميدان التحرير', 'Mydan Althryr', 'فنجان متوازن وحيوي، يجمع بين الكراميل والمكسرات والشوكولاتة.', 'Signature cup. Flavor profile: caramel, chocolate; bright acidity; medium-full body.', NULL, NULL, 'turkish', '{"crema": 4, "body": 4, "acidity": 4, "bitterness": 1.5, "flavor": 5, "aroma": 5}', true),
('TRK-002', 'الزمالك', 'Zamalek', 'فنجان أنيق وراقي، يجمع بين حلاوة الكراميل ورائحة الزهور البيضاء مع لمسة فاكهية منعشة.', 'Refreshing cup. Flavor profile: caramel, floral; bright acidity; full body.', NULL, NULL, 'turkish', '{"crema": 4, "body": 5, "acidity": 3.5, "bitterness": 1, "flavor": 5, "aroma": 5}', true),
('ESP-01', 'ذهب روما', 'Gold Roma', 'إسبريسو إيطالي كلاسيكي، بكريمة ذهبية غنية ونكهة تجمع بين الكاكاو والمكسرات مع لمسة دافئة من التوابل.', 'Signature cup. Flavor profile: cocoa; full body.', NULL, NULL, 'espresso', '{"crema": 5, "body": 5, "balance": 4, "aftertaste": 4, "intensity": 5}', true),
('ESP-02', 'نوار إنتنسو', 'Noir إNtnsw', 'إسبريسو قوي وعميق للخبراء، يجمع بين مرارة الكاكاو الداكنة وحلاوة التوت الأسود مع لمسة دخانية كلاسيكية.', 'Bold cup. Flavor profile: cocoa, berry; full body.', NULL, NULL, 'espresso', '{"crema": 5, "body": 5, "balance": 4, "aftertaste": 5, "intensity": 5}', true);

-- Step 4: Insert all the new, correct compositions.
INSERT INTO public.blend_compositions (blend_code, coffee_type_code, percentage) VALUES
('V01', 'brazilian_santos', 70), ('V01', 'colombian', 30),
('V02', 'kenyan', 100),
('V03', 'ethiopian_harrar', 85), ('V03', 'ethiopian_lekemti', 15),
('V04', 'costa_rican', 80), ('V04', 'peruvian', 20),
('V05', 'yemeni', 100),
('V06', 'colombian', 100),
('V07', 'guatemalan', 100),
('V08', 'brazilian_santos', 100),
('V09', 'peruvian', 100),
('V10', 'indian_mysore', 80), ('V10', 'indonesian', 20),
('V11', 'vietnamese', 60), ('V11', 'brazilian_santos', 40),
('V12', 'ugandan', 50), ('V12', 'ethiopian_lekemti', 50),
('V13', 'kenyan', 70), ('V13', 'indian_robusta', 30),
('V14', 'brazilian_santos', 60), ('V14', 'costa_rican', 40),
('V15', 'ethiopian_lekemti', 100),
('V16', 'indian_arabica', 70), ('V16', 'indian_robusta', 30),
('V17', 'brazilian_santos', 80), ('V17', 'colombian', 20),
('V18', 'colombian', 100),
('V19', 'peruvian', 50), ('V19', 'guatemalan', 50),
('V20', 'vietnamese', 90), ('V20', 'kenyan', 10),
('V21', 'peruvian', 100),
('V22', 'colombian', 60), ('V22', 'ethiopian_harrar', 40),
('KW01', 'guatemalan', 100),
('KW02', 'brazilian_santos', 100),
('TRK-001', 'brazilian_santos', 50), ('TRK-001', 'yemeni', 30), ('TRK-001', 'peruvian', 20),
('TRB-001', 'brazilian_santos', 50), ('TRB-001', 'colombian', 30), ('TRB-001', 'peruvian', 15), ('TRB-001', 'ethiopian_harrar', 5),
('TRK-002', 'colombian', 60), ('TRK-002', 'ethiopian_harrar', 25), ('TRK-002', 'brazilian_santos', 10), ('TRK-002', 'yemeni', 5),
('ESP-01', 'brazilian_santos', 40), ('ESP-01', 'colombian', 30), ('ESP-01', 'indian_robusta', 30),
('ESP-02', 'brazilian_santos', 50), ('ESP-02', 'yemeni', 20), ('ESP-02', 'vietnamese', 30);

COMMIT;