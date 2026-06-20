CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, role, full_name, phone_number)
  VALUES (
    new.id, 
    'user',
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'phone_number'
  );
  RETURN new;
END;
$function$