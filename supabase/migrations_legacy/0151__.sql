-- Enable RLS on the table for security
ALTER TABLE public.roastery_payouts ENABLE ROW LEVEL SECURITY;

-- Drop the old insecure policy if it exists
DROP POLICY IF EXISTS "Admins and roasters can insert roastery_payouts" ON public.roastery_payouts;

-- Create a new secure policy for INSERT
CREATE POLICY "Admins and roasters can insert roastery_payouts" ON public.roastery_payouts
FOR INSERT TO authenticated 
WITH CHECK (get_user_role() = ANY (ARRAY['admin'::text, 'roaster'::text]));