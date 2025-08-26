CREATE OR REPLACE FUNCTION public.get_user_role()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  user_role text;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN 'anon';
  END IF;
  SELECT role INTO user_role FROM public.profiles WHERE id = auth.uid();
  RETURN user_role;
END;
$function$