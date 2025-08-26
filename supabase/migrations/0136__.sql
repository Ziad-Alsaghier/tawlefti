-- Enable Row Level Security on the blend_compositions table
ALTER TABLE public.blend_compositions ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow administrators to perform all actions (SELECT, INSERT, UPDATE, DELETE)
CREATE POLICY "Admins can manage blend compositions"
ON public.blend_compositions
FOR ALL
USING ( (get_user_role() = 'admin'::text) )
WITH CHECK ( (get_user_role() = 'admin'::text) );

-- Create a policy to allow all users to view blend compositions (read-only access)
CREATE POLICY "Blend compositions are viewable by everyone"
ON public.blend_compositions
FOR SELECT
USING ( true );