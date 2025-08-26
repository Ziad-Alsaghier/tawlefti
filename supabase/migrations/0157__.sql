-- Create site_content table
CREATE TABLE public.site_content (
  key TEXT PRIMARY KEY,
  value JSONB,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public can read site content" ON public.site_content
FOR SELECT USING (true);

CREATE POLICY "Admins can manage site content" ON public.site_content
FOR ALL USING (get_user_role() = 'admin'::text)
WITH CHECK (get_user_role() = 'admin'::text);

-- Insert default content to start with
INSERT INTO public.site_content (key, value)
VALUES
  ('about_us', '{"title_ar": "من نحن؟", "content_ar": "في تَولِيفتِي™، نحن نؤمن بأن القهوة أكثر من مجرد مشروب؛ إنها تجربة. مهمتنا هي تمكين كل محب للقهوة من اكتشاف وصنع توليفتهم المثالية التي تناسب ذوقهم الفريد.", "title_en": "About Us", "content_en": "At Tawlefti™, we believe that coffee is more than just a drink; it''s an experience. Our mission is to empower every coffee lover to discover and create their perfect blend that suits their unique taste."}'),
  ('contact_us', '{"title_ar": "اتصل بنا", "content_ar": "للاستفسارات أو الدعم، يرجى التواصل معنا عبر البريد الإلكتروني: support@tawlefti.com", "title_en": "Contact Us", "content_en": "For inquiries or support, please contact us via email: support@tawlefti.com"}'),
  ('faq', '{"title_ar": "الأسئلة الشائعة", "title_en": "Frequently Asked Questions", "items": [{"q_ar": "كيف يعمل التطبيق؟", "a_ar": "ببساطة، اختر طريقة التحضير المفضلة لديك، ثم اضبط مؤشرات النكهة لتصفية التوليفات التي تناسب ذوقك. يمكنك بعد ذلك تخصيص طلبك وإضافته إلى السلة.", "q_en": "How does the app work?", "a_en": "Simply choose your favorite preparation method, then adjust the flavor sliders to filter blends that suit your taste. You can then customize your order and add it to the cart."}, {"q_ar": "ما هي مدة توصيل الطلبات؟", "a_ar": "تعتمد مدة التوصيل على موقعك. بشكل عام، يتم توصيل الطلبات داخل القاهرة خلال 24-48 ساعة.", "q_en": "How long does delivery take?", "a_en": "Delivery time depends on your location. Generally, orders within Cairo are delivered within 24-48 hours."}]}')
ON CONFLICT (key) DO NOTHING;