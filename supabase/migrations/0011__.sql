-- Create a helper function to safely get the user's role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  user_role text;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN 'anon';
  END IF;
  SELECT role INTO user_role FROM public.profiles WHERE id = auth.uid();
  RETURN user_role;
END;
$$;

-- Update all admin policies to use the new helper function

ALTER POLICY "Admins can manage all profiles." ON public.profiles
USING (public.get_user_role() = 'admin')
WITH CHECK (public.get_user_role() = 'admin');

ALTER POLICY "Allow admin to manage additives" ON public.additives
USING (public.get_user_role() = 'admin')
WITH CHECK (public.get_user_role() = 'admin');

ALTER POLICY "Allow admin to manage blends" ON public.blends
USING (public.get_user_role() = 'admin')
WITH CHECK (public.get_user_role() = 'admin');

ALTER POLICY "Allow admin to manage blend compositions" ON public.blend_compositions
USING (public.get_user_role() = 'admin')
WITH CHECK (public.get_user_role() = 'admin');

ALTER POLICY "Allow admin to manage coffee types" ON public.coffee_types
USING (public.get_user_role() = 'admin')
WITH CHECK (public.get_user_role() = 'admin');