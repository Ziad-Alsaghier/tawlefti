-- Drop the old price column and add four new specific price columns
ALTER TABLE public.coffee_types
DROP COLUMN price_per_kg,
ADD COLUMN price_green_kg numeric DEFAULT 0.00,
ADD COLUMN price_light_kg numeric DEFAULT 0.00,
ADD COLUMN price_medium_kg numeric DEFAULT 0.00,
ADD COLUMN price_dark_kg numeric DEFAULT 0.00;

-- Add a profit margin column to the method_status table
ALTER TABLE public.method_status
ADD COLUMN profit_margin numeric DEFAULT 1.4;