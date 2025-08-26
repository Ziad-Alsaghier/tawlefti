ALTER TABLE public.roastery_payouts
ADD CONSTRAINT fk_recorded_by_profile
FOREIGN KEY (recorded_by) REFERENCES public.profiles(id) ON DELETE SET NULL;