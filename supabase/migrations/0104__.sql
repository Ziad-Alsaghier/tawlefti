-- Create a table to store banned phone numbers
CREATE TABLE public.banned_phones (
    phone_number text NOT NULL PRIMARY KEY,
    reason text,
    banned_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.banned_phones ENABLE ROW LEVEL SECURITY;

-- Policies for the new table
CREATE POLICY "Admins can manage banned phones"
ON public.banned_phones FOR ALL
USING (get_user_role() = 'admin'::text)
WITH CHECK (get_user_role() = 'admin'::text);