-- Add address column to profiles table
ALTER TABLE public.profiles ADD COLUMN address TEXT;

-- Update the function to handle the new address field
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_role TEXT;
BEGIN
  -- Check if this is the first user being created
  IF (SELECT count(*) FROM auth.users) = 1 THEN
    v_role := 'admin';
  ELSE
    v_role := 'user';
  END IF;

  INSERT INTO public.profiles (id, role, full_name, phone_number, address)
  VALUES (
    new.id, 
    v_role, -- Use the determined role
    new.raw_user_meta_data ->> 'full_name', 
    new.raw_user_meta_data ->> 'phone_number',
    new.raw_user_meta_data ->> 'address'
  );
  RETURN new;
END;
$function$