-- Grant admin role to the specified user to ensure they can access the dashboard.
UPDATE public.profiles
SET role = 'admin'
WHERE id = (SELECT id FROM auth.users WHERE email = 'ahm.raouf@gmail.com' LIMIT 1);