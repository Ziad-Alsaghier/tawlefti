-- First, clear all existing coffee types to ensure a fresh start
DELETE FROM public.coffee_types;

-- Next, insert the new list of 16 coffee types with the adjusted prices (+20 EGP)
INSERT INTO public.coffee_types (name_ar, name_en, code, price_green, price_light, price_medium, price_dark) VALUES
('بن إندونيسي', 'Indonesian Coffee', 'IDC', 323, 393, 423, 443),
('بن أوغندي', 'Ugandan Coffee', 'UGC', 332, 400, 430, 450),
('بن فيتنامي', 'Vietnamese Coffee', 'VTC', 333, 396, 426, 446),
('بن هندي روبيستا', 'Indian Robusta', 'INR', 355, 435, 465, 485),
('بن حبشي لقميتي', 'Ethiopian Lekempti', 'ETL', 340, 410, 440, 460),
('بن برازيلي روبيستا', 'Brazilian Robusta', 'BRR', 313, 374, 404, 424),
('بن هندي أرابيكا بلانتيشن', 'Indian Arabica Plantation', 'IAP', 535, 644, 674, 694),
('بن كولومبي', 'Colombian Coffee', 'COC', 610, 737, 767, 787),
('بن جواتيمالا', 'Guatemalan Coffee', 'GTC', 700, 842, 872, 892),
('بن حبشي هراري', 'Ethiopian Harrar', 'ETH', 480, 585, 615, 635),
('بن هندي مايسور', 'Indian Mysore', 'INM', 680, 820, 850, 870),
('كينا AAA', 'Kenya AAA', 'KNA', 680, 820, 850, 870),
('بن بيرو', 'Peruvian Coffee', 'PEC', 660, 794, 824, 844),
('بن كوستا ريكي', 'Costa Rican Coffee', 'CRC', 680, 820, 850, 870),
('بن يمني خولاني', 'Yemeni Khawlani', 'YEK', 1000, 1207, 1237, 1257),
('بن برازيلي سانتوس فاين كاب', 'Brazilian Santos Fine Cup', 'BSF', 480, 580, 610, 630);