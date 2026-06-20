CREATE TABLE public.roastery_payouts (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    payout_amount numeric NOT NULL,
    payout_date timestamptz DEFAULT now() NOT NULL,
    recorded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL, -- المستخدم الذي سجل الدفعة
    created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.roastery_payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to insert roastery_payouts"
ON public.roastery_payouts FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to select roastery_payouts"
ON public.roastery_payouts FOR SELECT
TO authenticated
USING (true);