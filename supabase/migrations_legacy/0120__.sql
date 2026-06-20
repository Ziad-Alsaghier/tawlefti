-- الخطوة 1: حذف مكونات التوليفات لفك الارتباط.
DELETE FROM public.blend_compositions;

-- الخطوة 2: حذف التوليفات نفسها لأنها أصبحت فارغة.
DELETE FROM public.blends;

-- الخطوة 3: الآن يمكننا حذف أنواع البن القديمة بأمان.
DELETE FROM public.coffee_types;

-- الخطوة 4: إدراج قائمة أنواع البن الجديدة.
INSERT INTO public.coffee_types (code, name_ar, name_en, price_green_kg, price_light_kg, price_medium_kg, price_dark_kg, is_active, stock_green_kg, stock_light_kg, stock_medium_kg, stock_dark_kg) VALUES
('indonesian', 'إندونيسي', 'Indonesian', 333, 403, 433, 453, TRUE, 1, 1, 1, 1),
('ugandan', 'أوغندي', 'Ugandan', 342, 410, 440, 460, TRUE, 1, 1, 1, 1),
('vietnamese', 'فيتنامي', 'Vietnamese', 343, 406, 436, 456, TRUE, 1, 1, 1, 1),
('indian_robusta', 'هندي روبيستا', 'Indian Robusta', 365, 445, 475, 495, TRUE, 1, 1, 1, 1),
('ethiopian_lekemti', 'حبشي لقمتي', 'Ethiopian Lekemti', 350, 420, 450, 470, TRUE, 1, 1, 1, 1),
('brazilian_robusta', 'برازيلي روبيستا', 'Brazilian Robusta', 323, 384, 414, 434, TRUE, 1, 1, 1, 1),
('indian_arabica', 'هندي أربيكا', 'Indian Arabica', 545, 654, 684, 704, TRUE, 1, 1, 1, 1),
('colombian', 'كولومبي', 'Colombian', 620, 747, 777, 797, TRUE, 1, 1, 1, 1),
('guatemala', 'جواتيمالا', 'Guatemala', 710, 852, 882, 902, TRUE, 1, 1, 1, 1),
('ethiopian_harrar', 'حبشي هراري', 'Ethiopian Harrar', 490, 595, 625, 645, TRUE, 1, 1, 1, 1),
('indian_mysore', 'هندي ميسور', 'Indian Mysore', 690, 830, 860, 880, TRUE, 1, 1, 1, 1),
('kenya', 'كينيا', 'Kenya', 690, 830, 860, 880, TRUE, 1, 1, 1, 1),
('peru', 'بيرو', 'Peru', 670, 804, 834, 854, TRUE, 1, 1, 1, 1),
('costa_rican', 'كوستا ريكي', 'Costa Rican', 690, 830, 860, 880, TRUE, 1, 1, 1, 1),
('yemeni', 'يمني', 'Yemeni', 1010, 1217, 1247, 1267, TRUE, 1, 1, 1, 1),
('brazilian', 'برازيلي سانتوس', 'Brazilian Santos', 490, 590, 620, 640, TRUE, 1, 1, 1, 1);