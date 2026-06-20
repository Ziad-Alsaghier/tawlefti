-- الخطوة 1: تنظيف البيانات القديمة بالترتيب الصحيح لتجنب أخطاء الربط
DELETE FROM public.blend_compositions;
DELETE FROM public.blends;
DELETE FROM public.coffee_types;

-- الخطوة 2: إدخال جميع أنواع البن الجديدة مع أسعارها الصحيحة والنهائية
INSERT INTO public.coffee_types (code, name_ar, name_en, is_active, price_green_kg, price_light_kg, price_medium_kg, price_dark_kg) VALUES
('brazilian_santos', 'برازيلي سانتوس', 'Brazilian Santos', true, 380, 551, 598, 574),
('colombian_supremo', 'كولومبي سوبريمو', 'Colombian Supremo', true, 480, 696, 755, 725),
('ethiopian_yirgacheffe', 'إثيوبي يرقاشيفي', 'Ethiopian Yirgacheffe', true, 750, 1088, 1180, 1132),
('guatemalan_antigua', 'جواتيمالي أنتيجوا', 'Guatemalan Antigua', true, 550, 798, 865, 830),
('costa_rican_tarrazu', 'كوستاريكي تارازو', 'Costa Rican Tarrazu', true, 600, 870, 944, 905),
('kenyan_aa', 'كيني AA', 'Kenyan AA', true, 800, 1160, 1258, 1207),
('indian_monsooned', 'هندي مونسونيد مالابار', 'Indian Monsooned Malabar', true, 450, 653, 708, 679),
('yemeni_khawlani', 'يمني خولاني', 'Yemeni Khawlani', true, 2000, 2900, 3145, 3018),
('robusta_vietnam', 'روبوستا فيتنامي', 'Robusta Vietnam', true, 320, 464, 503, 483);

-- الخطوة 3: إدخال التوليفات الجديدة
INSERT INTO public.blends (code, name_ar, name_en, notes_ar, notes_en, method_id, is_active, sensory_profile) VALUES
('T01', 'توليفة القصر', 'Palace Blend', 'قوية، وش ثقيل، مرارة متوازنة', 'Strong, heavy foam, balanced bitterness', 'turkish', true, '{"crema": 5, "body": 5, "acidity": 2, "bitterness": 4, "flavor": 5, "aroma": 3}'),
('T02', 'توليفة السلطان', 'Sultan Blend', 'غنية، قوام ممتلئ، إيحاءات مكسرات', 'Rich, full body, nutty notes', 'turkish', true, '{"crema": 4, "body": 5, "acidity": 3, "bitterness": 3, "flavor": 4, "aroma": 4}'),
('T03', 'توليفة الباشا', 'Pasha Blend', 'فاخرة، نكهات فواكه مجففة، حمضية خفيفة', 'Luxurious, dried fruit flavors, light acidity', 'turkish', true, '{"crema": 4, "body": 4, "acidity": 4, "bitterness": 2, "flavor": 5, "aroma": 5}'),
('T04', 'توليفة خاصة', 'Special Blend', 'عطرية، إيحاءات زهرية، حلاوة واضحة', 'Aromatic, floral notes, clear sweetness', 'turkish', true, '{"crema": 3, "body": 3, "acidity": 5, "bitterness": 2, "flavor": 4, "aroma": 5}'),
('T05', 'توليفة أرابيكا', 'Arabica Blend', 'كلاسيكية، متوازنة، إيحاءات شوكولاتة', 'Classic, balanced, chocolate notes', 'turkish', true, '{"crema": 3, "body": 4, "acidity": 3, "bitterness": 3, "flavor": 4, "aroma": 3}'),
('E01', 'إسبريسو كلاسيك', 'Classic Espresso', 'كريما كثيفة، قوام ثقيل، مرارة قوية', 'Thick crema, heavy body, strong bitterness', 'espresso', true, '{"crema": 5, "body": 5, "balance": 2, "aftertaste": 3, "intensity": 5}'),
('E02', 'إسبريسو إيطاليانو', 'Italiano Espresso', 'متوازن، إيحاءات كراميل وشوكولاتة داكنة', 'Balanced, caramel and dark chocolate notes', 'espresso', true, '{"crema": 4, "body": 4, "balance": 4, "aftertaste": 4, "intensity": 4}'),
('E03', 'إسبريسو سبيشيالتي', 'Specialty Espresso', 'فاكهي، حمضية مشرقة، قوام حريري', 'Fruity, bright acidity, silky body', 'espresso', true, '{"crema": 4, "body": 3, "balance": 5, "aftertaste": 5, "intensity": 4}'),
('E04', 'إسبريسو مونديال', 'Mondial Espresso', 'معقد، ترابي، قوام ممتلئ', 'Complex, earthy, full body', 'espresso', true, '{"crema": 4, "body": 5, "balance": 3, "aftertaste": 4, "intensity": 5}'),
('E05', 'إسبريسو 100% أرابيكا', '100% Arabica Espresso', 'نقي، حمضية واضحة، إيحاءات حمضيات', 'Pure, clear acidity, citrus notes', 'espresso', true, '{"crema": 3, "body": 3, "balance": 4, "aftertaste": 4, "intensity": 3}'),
('V01', 'يرقاشيفي V60', 'Yirgacheffe V60', 'زهري، ليمون، شاي أسود', 'Floral, lemon, black tea', 'v60', true, '{"clarity": 5, "acidity": 5, "aroma": 5, "complexity": 4, "body": 2}'),
('V02', 'كولومبي V60', 'Colombian V60', 'كراميل، تفاح أحمر، مكسرات', 'Caramel, red apple, nuts', 'v60', true, '{"clarity": 4, "acidity": 3, "aroma": 3, "complexity": 3, "body": 4}'),
('C01', 'كيمكس النقاء', 'Chemex Purity', 'توت أسود، حمضية نبيذ، قوام عصيري', 'Blackberry, winey acidity, juicy body', 'chemex', true, '{"clarity": 5, "acidity": 4, "aroma": 4, "complexity": 4, "body": 3}'),
('K01', 'كاليتا المتوازنة', 'Kalita Balance', 'شوكولاتة بالحليب، لوز، حلاوة طويلة', 'Milk chocolate, almond, long sweetness', 'kalita', true, '{"clarity": 4, "acidity": 3, "aroma": 4, "complexity": 3, "body": 4}');

-- الخطوة 4: إدخال مكونات التوليفات
INSERT INTO public.blend_compositions (blend_code, coffee_type_code, percentage) VALUES
('T01', 'brazilian_santos', 70),
('T01', 'robusta_vietnam', 30),
('T02', 'colombian_supremo', 50),
('T02', 'brazilian_santos', 30),
('T02', 'indian_monsooned', 20),
('T03', 'yemeni_khawlani', 100),
('T04', 'ethiopian_yirgacheffe', 60),
('T04', 'guatemalan_antigua', 40),
('T05', 'brazilian_santos', 100),
('E01', 'brazilian_santos', 60),
('E01', 'robusta_vietnam', 40),
('E02', 'colombian_supremo', 50),
('E02', 'brazilian_santos', 30),
('E02', 'robusta_vietnam', 20),
('E03', 'ethiopian_yirgacheffe', 70),
('E03', 'colombian_supremo', 30),
('E04', 'brazilian_santos', 40),
('E04', 'guatemalan_antigua', 30),
('E04', 'indian_monsooned', 30),
('E05', 'colombian_supremo', 50),
('E05', 'costa_rican_tarrazu', 50),
('V01', 'ethiopian_yirgacheffe', 100),
('V02', 'colombian_supremo', 100),
('C01', 'kenyan_aa', 100),
('K01', 'guatemalan_antigua', 60),
('K01', 'costa_rican_tarrazu', 40);