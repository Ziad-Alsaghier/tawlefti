CREATE TABLE public.method_status (
  method_id TEXT PRIMARY KEY,
  is_active BOOLEAN NOT NULL DEFAULT true
);

ALTER TABLE public.method_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view method statuses" ON public.method_status
FOR SELECT USING (true);

CREATE POLICY "Admins can manage method statuses" ON public.method_status
FOR ALL USING (get_user_role() = 'admin'::text);