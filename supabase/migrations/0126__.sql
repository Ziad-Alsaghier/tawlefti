-- Use "IF NOT EXISTS" to prevent errors on re-run
CREATE TABLE IF NOT EXISTS public.expense_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar TEXT NOT NULL UNIQUE,
  name_en TEXT NOT NULL UNIQUE,
  description_ar TEXT,
  description_en TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage expense categories" ON public.expense_categories;
CREATE POLICY "Admins can manage expense categories" ON public.expense_categories FOR ALL USING (get_user_role() = 'admin');

-- Use "ON CONFLICT DO NOTHING" to prevent duplicate entries
INSERT INTO public.expense_categories (name_ar, name_en, description_ar)
VALUES
  ('مرتبات', 'Salaries', 'رواتب الموظفين الشهرية'),
  ('إيجار', 'Rent', 'إيجار مساحة العمل أو المحل'),
  ('فواتير', 'Utilities', 'فواتير كهرباء، مياه، غاز، إنترنت'),
  ('تسويق', 'Marketing', 'مصروفات الحملات الإعلانية والتسويق'),
  ('صيانة', 'Maintenance', 'مصروفات صيانة المعدات والأجهزة'),
  ('مشتريات مواد خام', 'Raw Material Purchases', 'تكلفة شراء البن والتحويجات'),
  ('مصروفات أخرى', 'Other Expenses', 'أي مصروفات أخرى غير مصنفة')
ON CONFLICT (name_ar) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL DEFAULT now(),
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category_id UUID REFERENCES public.expense_categories(id),
  amount NUMERIC NOT NULL CHECK (amount >= 0),
  description TEXT NOT NULL,
  related_order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  related_purchase_id BIGINT REFERENCES public.purchases(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage transactions" ON public.transactions;
CREATE POLICY "Admins can manage transactions" ON public.transactions FOR ALL USING (get_user_role() = 'admin');

-- "CREATE OR REPLACE" is already safe for re-running
CREATE OR REPLACE FUNCTION public.handle_new_order_transaction()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.transactions (date, type, amount, description, related_order_id)
  VALUES (
    NEW.created_at::date,
    'income',
    NEW.total_price,
    'إيراد من طلب العميل: ' || NEW.customer_name,
    NEW.id
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_order_created_create_transaction ON public.orders;
CREATE TRIGGER on_order_created_create_transaction
  AFTER INSERT ON public.orders
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_order_transaction();

CREATE OR REPLACE FUNCTION public.handle_new_purchase_transaction()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_category_id UUID;
BEGIN
  SELECT id INTO v_category_id FROM public.expense_categories WHERE name_ar = 'مشتريات مواد خام' LIMIT 1;
  INSERT INTO public.transactions (date, type, category_id, amount, description, related_purchase_id)
  VALUES (
    NEW.created_at::date,
    'expense',
    v_category_id,
    NEW.cost,
    'شراء ' || NEW.item_type || ' بكود ' || NEW.item_code,
    NEW.id
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_purchase_created_create_transaction ON public.purchases;
CREATE TRIGGER on_purchase_created_create_transaction
  AFTER INSERT ON public.purchases
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_purchase_transaction();