-- Clear existing additives to prevent duplicates
DELETE FROM public.additives;

-- Add the new list of additives provided by the user
INSERT INTO public.additives (name_ar, name_en, price_per_250g, is_active) VALUES
('حبهان', 'Cardamom', 15, true),
('قرنفل', 'Cloves', 10, true),
('مستكة', 'Mastic', 25, true),
('جوزة الطيب', 'Nutmeg', 15, true),
('قرفة', 'Cinnamon', 10, true),
('زنجبيل', 'Ginger', 15, true),
('ورد', 'Rose Petals', 10, true),
('جينسنج', 'Ginseng', 50, true),
('ورق لورا', 'Bay Leaf', 10, true);