-- Enable Row Level Security on the blends table
ALTER TABLE public.blends ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow administrators to perform all actions (SELECT, INSERT, UPDATE, DELETE)
CREATE POLICY "Admins can manage blends"
ON public.blends
FOR ALL
USING ( (get_user_role() = 'admin'::text) )
WITH CHECK ( (get_user_role() = 'admin'::text) );

-- Create a policy to allow all users to view active blends
CREATE POLICY "Public can view active blends"
ON public.blends
FOR SELECT
USING ( is_active = true );