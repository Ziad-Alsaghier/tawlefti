-- Drop the table if it exists to ensure a clean start
DROP TABLE IF EXISTS public.temp_blend_compositions;

-- Create a new temporary table to receive the CSV data
CREATE TABLE public.temp_blend_compositions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blend_code TEXT,
    coffee_type_code TEXT,
    percentage INTEGER,
    created_at TIMESTAMPTZ DEFAULT now()
);