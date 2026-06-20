-- Create a table to store customer loyalty points
CREATE TABLE public.customer_loyalty (
    phone_number text NOT NULL PRIMARY KEY,
    points integer DEFAULT 0 NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS and set up policies
ALTER TABLE public.customer_loyalty ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view loyalty points"
ON public.customer_loyalty FOR SELECT
USING (get_user_role() = 'admin'::text);

-- Add columns to orders table to track points
ALTER TABLE public.orders
ADD COLUMN points_earned integer,
ADD COLUMN points_redeemed integer;