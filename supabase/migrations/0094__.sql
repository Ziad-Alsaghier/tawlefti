BEGIN;

-- Step 1: Insert all necessary coffee types first.
-- Using ON CONFLICT to avoid errors if some types already exist.
INSERT INTO public.coffee_types (code, name_ar, name_en, price_per_kg, is_active) VALUES
('BRA', 'بن برازيلي سانتوس', 'Brazilian Santos', 350.00, true),
('COL', 'بن كولومبي سوبريمو', 'Colombian Supremo', 450.00, true),
('ETH', 'بن إثيوبي يورغاتشيف', 'Ethiopian Yirgacheffe', 550.00, true),
('GUA', 'بن جواتيمالا أنتجوا', 'Guatemalan Antigua', 480.00, true),
('IDN', 'بن إندونيسي سومطرة', 'Indonesian Sumatra', 420.00, true),
('IND', 'بن هندي مون سون', 'Indian Monsooned Malabar', 380.00, true),
('YEM', 'بن يمني موكا', 'Yemeni Mocha', 900.00, true),
('VIE', 'بن فيتنامي', 'Vietnamese Robusta', 250.00, true),
('IND-R', 'بن هندي روبوستا', 'Indian Robusta', 280.00, true),
('BRA-G', 'بن برازيلي أخضر', 'Green Brazilian', 200.00, true),
('IDN-G', 'بن إندونيسي أخضر', 'Green Indonesian', 250.00, true),
('VIE-G', 'بن فيتنامي أخضر', 'Green Vietnamese', 150.00, true)
ON CONFLICT (code) DO NOTHING;

-- Step 2: Clear old data for ALL blends we are about to insert.
DELETE FROM public.blend_compositions WHERE blend_code IN ('V01', 'V02', 'V03', 'V04', 'V05', 'C01', 'C02', 'K01', 'K02', 'T01', 'T02', 'T03', 'T04', 'T05', 'E01', 'E02', 'E03', 'E04', 'E05', 'FP01', 'FP02', 'AP01', 'AP02', 'CB01', 'CB02', 'GCI01', 'GB01', 'GHI01');
DELETE FROM public.blends WHERE code IN ('V01', 'V02', 'V03', 'V04', 'V05', 'C01', 'C02', 'K01', 'K02', 'T01', 'T02', 'T03', 'T04', 'T05', 'E01', 'E02', 'E03', 'E04', 'E05', 'FP01', 'FP02', 'AP01', 'AP02', 'CB01', 'CB02', 'GCI01', 'GB01', 'GHI01');

-- Step 3: Insert new blend data.
INSERT INTO public.blends (code, name_ar, name_en, notes_ar, notes_en, preparation_notes_ar, preparation_notes_en, method_id, sensory_profile, is_active) VALUES
('V01', 'توليفة الفاكهة الحمراء', 'Red Fruit Blend', 'فراولة، توت، كرز', 'Strawberry, Raspberry, Cherry', 'ماء 93°م، وقت 2:30 د', 'water 93°C; 2:30 min', 'v60', '{"clarity": 4, "acidity": 5, "aroma": 4, "complexity": 4, "body": 3}', true),
('V02', 'توليفة الشوكولاتة', 'Chocolate Blend', 'شوكولاتة داكنة، بندق، كراميل', 'Dark Chocolate, Hazelnut, Caramel', 'صب متقطع، ماء 92°م، 3 دقائق', 'Pulse pour; water 92°C; 3 min', 'v60', '{"clarity": 3, "acidity": 2, "aroma": 4, "complexity": 3, "body": 5}', true),
('V03', 'التوليفة الزهرية', 'Floral Blend', 'ياسمين، ورد، خوخ', 'Jasmine, Rose, Peach', 'صب دائري بطيء، ماء 90°م', 'Circular pour (slow); water 90°C', 'v60', '{"clarity": 5, "acidity": 4, "aroma": 5, "complexity": 4, "body": 2}', true),
('V04', 'التوليفة الكلاسيكية', 'Classic Blend', 'مكسرات، سكر بني، متوازنة', 'Nuts, Brown Sugar, Balanced', 'صب مركز، ماء 94°م، 2:45 د', 'Center pour; water 94°C; 2:45 min', 'v60', '{"clarity": 4, "acidity": 3, "aroma": 3, "complexity": 3, "body": 4}', true),
('V05', 'التوليفة الشرقية', 'Oriental Blend', 'توابل، زعفران، عسل', 'Spices, Saffron, Honey', 'صب طبقات، ماء 88°م، تضاف رشة زعفران', 'Layered pour; water 88°C; add saffron', 'v60', '{"clarity": 3, "acidity": 3, "aroma": 5, "complexity": 5, "body": 4}', true),
('C01', 'توليفة الوضوح', 'Clarity Blend', 'زهري، حمضيات، شاي أسود', 'Floral, Citrus, Black Tea', 'طحنة متوسطة الخشونة، ماء 94°م', 'Medium-coarse grind; water 94°C', 'chemex', '{"clarity": 5, "acidity": 4, "aroma": 4, "complexity": 3, "body": 2}', true),
('C02', 'توليفة النقاء', 'Purity Blend', 'توت أحمر، كراميل، لوز', 'Red Berries, Caramel, Almond', 'نسبة 1:17، صب على 4 مراحل', '1:17 ratio; 4-stage pour', 'chemex', '{"clarity": 5, "acidity": 3, "aroma": 3, "complexity": 4, "body": 3}', true),
('K01', 'توليفة التوازن', 'Balance Blend', 'شوكولاتة بالحليب، مكسرات، تفاح أحمر', 'Milk Chocolate, Nuts, Red Apple', 'طحنة متوسطة، ترطيب 45 ثانية', 'Medium grind; 45s bloom', 'kalita', '{"clarity": 4, "acidity": 3, "aroma": 4, "complexity": 4, "body": 4}', true),
('K02', 'توليفة الحلاوة', 'Sweetness Blend', 'عسل، فواكه مجففة، قرفة', 'Honey, Dried Fruits, Cinnamon', 'وقت الاستخلاص 3:30 د', '3:30 min extraction time', 'kalita', '{"clarity": 4, "acidity": 4, "aroma": 3, "complexity": 3, "body": 5}', true),
('T01', 'الأصالة', 'Authenticity', 'كلاسيكية، قوية، مرة قليلاً', 'Classic, Strong, Slightly Bitter', 'نار هادئة، لا تدعها تغلي', 'Low heat; do not boil', 'turkish', '{"crema": 4, "body": 5, "acidity": 2, "bitterness": 4, "flavor": 5, "aroma": 4}', true),
('T02', 'الوش الذهبي', 'Golden Foam', 'متوازنة، وش كثيف، حلاوة متوسطة', 'Balanced, Thick Foam, Medium Sweetness', 'طحنة ناعمة جداً (بودرة)', 'Very fine grind (powder)', 'turkish', '{"crema": 5, "body": 4, "acidity": 3, "bitterness": 3, "flavor": 4, "aroma": 4}', true),
('T03', 'الغامقة', 'The Dark One', 'محمصة، دخانية، قوام ثقيل', 'Toasted, Smoky, Heavy Body', 'استخدم ماء بارد، حرك مرة واحدة', 'Use cold water; stir once', 'turkish', '{"crema": 3, "body": 5, "acidity": 1, "bitterness": 5, "flavor": 5, "aroma": 3}', true),
('T04', 'الوسط', 'The Medium', 'مكسرات، كاكاو، متوازنة', 'Nuts, Cocoa, Balanced', 'وش مزدوج، يقدم مع راحة الحلقوم', 'Double foam; serve with Turkish delight', 'turkish', '{"crema": 4, "body": 4, "acidity": 3, "bitterness": 3, "flavor": 4, "aroma": 4}', true),
('T05', 'المحوجة', 'Spiced Blend', 'حبهان، قرنفل، غنية بالنكهة', 'Cardamom, Clove, Rich Flavor', 'إضافة حبهان مطحون طازج', 'Add freshly ground cardamom', 'turkish', '{"crema": 4, "body": 4, "acidity": 2, "bitterness": 3, "flavor": 5, "aroma": 5}', true),
('E01', 'كلاسيكو', 'Classico', 'شوكولاتة داكنة، مكسرات محمصة، كريمية', 'Dark Chocolate, Toasted Nuts, Creamy', '18 جرام بن، استخلاص 28 ثانية', '18g dose; 28s extraction', 'espresso', '{"crema": 5, "body": 5, "balance": 4, "aftertaste": 4, "intensity": 4}', true),
('E02', 'الفاتح', 'The Light One', 'فاكهية، حمضية مشرقة، كراميل', 'Fruity, Bright Acidity, Caramel', 'حرارة 92°م، ضغط 9 بار', '92°C temp; 9 bar pressure', 'espresso', '{"crema": 4, "body": 3, "balance": 4, "aftertaste": 3, "intensity": 3}', true),
('E03', 'القوي', 'The Strong One', 'قوية، مرة، روبوستا', 'Intense, Bitter, Robusta', 'طحنة ناعمة، توزيع متساوٍ', 'Fine grind; even distribution', 'espresso', '{"crema": 5, "body": 5, "balance": 2, "aftertaste": 5, "intensity": 5}', true),
('E04', 'المتوازن', 'The Balanced One', 'متناغمة، حلاوة، قوام متوسط', 'Harmonious, Sweet, Medium Body', 'نسبة 1:2 (18 جرام بن لـ 36 جرام سائل)', '1:2 ratio (18g in, 36g out)', 'espresso', '{"crema": 4, "body": 4, "balance": 5, "aftertaste": 4, "intensity": 4}', true),
('E05', 'السبيشيالتي', 'Specialty', 'معقدة، زهرية، فاكهية', 'Complex, Floral, Fruity', 'تسخين مسبق للبورتافلتر والكوب', 'Preheat portafilter and cup', 'espresso', '{"crema": 4, "body": 4, "balance": 5, "aftertaste": 5, "intensity": 4}', true),
('FP01', 'الغني', 'The Rich One', 'قوام ممتلئ، شوكولاتة، ترابي', 'Full Body, Chocolate, Earthy', 'طحنة خشنة، نقع 4 دقائق', 'Coarse grind; 4 min steep', 'french-press', '{"clarity": 2, "acidity": 2, "aroma": 4, "complexity": 4, "body": 5}', true),
('FP02', 'الناعم', 'The Smooth One', 'ناعم، حلاوة، حمضية منخفضة', 'Smooth, Sweet, Low Acidity', 'كسر القشرة بعد دقيقة واحدة', 'Break crust after 1 min', 'french-press', '{"clarity": 3, "acidity": 3, "aroma": 3, "complexity": 3, "body": 4}', true),
('AP01', 'المتعدد', 'The Versatile', 'نظيف، متوازن، فاكهي', 'Clean, Balanced, Fruity', 'طريقة مقلوبة، حرارة 85°م', 'Inverted method; 85°C temp', 'aeropress', '{"clarity": 4, "acidity": 4, "aroma": 4, "complexity": 4, "body": 3}', true),
('AP02', 'المركز', 'The Concentrated', 'شبيه بالإسبريسو، قوي، كثيف', 'Espresso-like, Strong, Intense', 'نقع دقيقتين، ضغط 30 ثانية', '2 min steep; 30s press', 'aeropress', '{"clarity": 3, "acidity": 3, "aroma": 5, "complexity": 5, "body": 5}', true),
('CB01', 'المنعش', 'The Refreshing', 'ناعم، شوكولاتة، حمضية شبه معدومة', 'Smooth, Chocolate, Near-zero Acidity', 'نقع 16 ساعة في الثلاجة', '16hr steep in fridge', 'cold-brew', '{"softness": 5, "sweetness": 4, "body": 4, "acidity_clarity": 4, "intensity": 4}', true),
('CB02', 'الفاكهي', 'The Fruity', 'فواكه استوائية، حلاوة عالية، خفيف', 'Tropical Fruits, High Sweetness, Light', 'نسبة 1:8، تصفية مزدوجة', '1:8 ratio; double filter', 'cold-brew', '{"softness": 4, "sweetness": 5, "body": 3, "acidity_clarity": 5, "intensity": 3}', true),
('GCI01', 'النقع البارد', 'Cold Infusion', 'عشبي، خفيف، مرارة قليلة', 'Herbal, Light, Low Bitterness', 'نقع بارد 12 ساعة', '12hr cold steep', 'cold-infusion', '{"bitterness": 2, "body": 2, "flavor": 3, "aroma": 3, "color": 2}', true),
('GB01', 'المغلي', 'Boiled', 'قوي، مر، ترابي', 'Strong, Bitter, Earthy', 'غلي لمدة 10 دقائق', 'Boil for 10 minutes', 'boiling', '{"bitterness": 4, "body": 4, "flavor": 4, "aroma": 2, "color": 4}', true),
('GHI01', 'النقع الساخن', 'Hot Infusion', 'شبيه بالشاي، معتدل، عشبي', 'Tea-like, Moderate, Herbal', 'نقع ساخن 7 دقائق (80°م)', '7 min hot steep (80°C)', 'hot-infusion', '{"bitterness": 3, "body": 3, "flavor": 4, "aroma": 4, "color": 3}', true);

-- Step 4: Insert new blend composition data.
INSERT INTO public.blend_compositions (blend_code, coffee_type_code, percentage) VALUES
('V01', 'ETH', 100),
('V02', 'BRA', 70), ('V02', 'IND', 30),
('V03', 'ETH', 60), ('V03', 'GUA', 40),
('V04', 'COL', 50), ('V04', 'BRA', 50),
('V05', 'YEM', 80), ('V05', 'IND', 20),
('C01', 'ETH', 70), ('C01', 'GUA', 30),
('C02', 'COL', 60), ('C02', 'BRA', 40),
('K01', 'BRA', 50), ('K01', 'GUA', 50),
('K02', 'ETH', 60), ('K02', 'COL', 40),
('T01', 'BRA', 100),
('T02', 'BRA', 70), ('T02', 'COL', 30),
('T03', 'IND', 60), ('T03', 'VIE', 40),
('T04', 'BRA', 50), ('T04', 'IND', 50),
('T05', 'BRA', 100),
('E01', 'BRA', 70), ('E01', 'IND', 30),
('E02', 'ETH', 100),
('E03', 'IND-R', 70), ('E03', 'VIE', 30),
('E04', 'COL', 50), ('E04', 'GUA', 50),
('E05', 'ETH', 60), ('E05', 'YEM', 40),
('FP01', 'IDN', 100),
('FP02', 'BRA', 60), ('FP02', 'COL', 40),
('AP01', 'ETH', 50), ('AP01', 'GUA', 50),
('AP02', 'IDN', 70), ('AP02', 'IND-R', 30),
('CB01', 'BRA', 100),
('CB02', 'ETH', 100),
('GCI01', 'BRA-G', 100),
('GB01', 'VIE-G', 100),
('GHI01', 'IDN-G', 100);

COMMIT;