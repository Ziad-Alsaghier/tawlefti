-- Create the table for notification templates
CREATE TABLE public.notification_templates (
  status TEXT PRIMARY KEY,
  is_active BOOLEAN NOT NULL DEFAULT false,
  title_template TEXT NOT NULL,
  body_template TEXT NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;

-- Define policies for access control
CREATE POLICY "Admins can manage notification templates"
ON public.notification_templates
FOR ALL
USING (get_user_role() = 'admin'::text)
WITH CHECK (get_user_role() = 'admin'::text);

CREATE POLICY "Allow public read access to templates"
ON public.notification_templates
FOR SELECT
USING (true);

-- Insert default templates for each order status
INSERT INTO public.notification_templates (status, is_active, title_template, body_template)
VALUES
  ('pending', false, 'تم استلام طلبك بنجاح!', 'طلبك الجديد لتوليفة {blend_name} قيد المراجعة. رقم الطلب: #{order_id_short}'),
  ('processing', true, 'طلبك قيد التجهيز', 'بدأنا في تجهيز طلبك #{order_id_short} لتوليفة {blend_name}.'),
  ('shipped', true, 'طلبك في الطريق إليك', 'تم شحن طلبك #{order_id_short} وهو الآن في طريقه إليك.'),
  ('completed', true, 'تم توصيل طلبك!', 'نأمل أن تستمتع بتوليفتك {blend_name}. شكرًا لطلبك!'),
  ('cancelled', false, 'تم إلغاء طلبك', 'تم إلغاء طلبك #{order_id_short} بنجاح.')
ON CONFLICT (status) DO NOTHING;