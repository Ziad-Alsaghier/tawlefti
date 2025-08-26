-- Create table for store settings
CREATE TABLE IF NOT EXISTS public.store_settings (
  key TEXT PRIMARY KEY,
  value JSONB,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Add Row Level Security to the new table
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Policy for Admins to manage settings
DROP POLICY IF EXISTS "Admins can manage settings" ON public.store_settings;
CREATE POLICY "Admins can manage settings" ON public.store_settings
  FOR ALL
  USING (get_user_role() = 'admin'::text)
  WITH CHECK (get_user_role() = 'admin'::text);

-- Policy for public to read settings
DROP POLICY IF EXISTS "Public can view settings" ON public.store_settings;
CREATE POLICY "Public can view settings" ON public.store_settings
  FOR SELECT
  USING (true);

-- Insert default values if they don't exist
INSERT INTO public.store_settings (key, value, description)
VALUES
  ('operating_hours', '{"open": "09:00", "close": "01:00"}', 'Store opening and closing times (24h format)')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.store_settings (key, value, description)
VALUES
  ('delivery_slots', '{"slots": ["12:00 - 14:00", "14:00 - 16:00", "16:00 - 18:00", "18:00 - 20:00"]}', 'Available delivery slots for next-day delivery')
ON CONFLICT (key) DO NOTHING;

-- Add delivery_slot column to orders table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS(SELECT *
    FROM information_schema.columns
    WHERE table_schema = 'public' and table_name='orders' and column_name='delivery_slot')
  THEN
      ALTER TABLE "public"."orders" ADD COLUMN "delivery_slot" text;
  END IF;
END;
$$;