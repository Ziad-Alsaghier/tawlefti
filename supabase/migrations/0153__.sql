-- التأكد من وجود فئة "مرتبات" في جدول فئات المصروفات
INSERT INTO public.expense_categories (name_ar, name_en, description_ar)
SELECT 'مرتبات', 'Salaries', 'تشمل جميع رواتب الموظفين'
WHERE NOT EXISTS (SELECT 1 FROM public.expense_categories WHERE name_ar = 'مرتبات');

-- 1. إنشاء جدول الرواتب الأساسية
CREATE TABLE public.salaries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_name TEXT NOT NULL,
    salary_amount NUMERIC NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.salaries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage salaries" ON public.salaries FOR ALL TO authenticated USING (get_user_role() = 'admin'::text) WITH CHECK (get_user_role() = 'admin'::text);

-- 2. إنشاء جدول سجل مدفوعات الرواتب
CREATE TABLE public.salary_payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    salary_id UUID NOT NULL REFERENCES public.salaries(id) ON DELETE CASCADE,
    payment_date DATE NOT NULL,
    amount_paid NUMERIC NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.salary_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage salary payments" ON public.salary_payments FOR ALL TO authenticated USING (get_user_role() = 'admin'::text) WITH CHECK (get_user_role() = 'admin'::text);

-- 3. إنشاء دالة Trigger لربط مدفوعات الرواتب بجدول المعاملات تلقائيًا
CREATE OR REPLACE FUNCTION public.handle_new_salary_payment_transaction()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_category_id UUID;
  v_employee_name TEXT;
BEGIN
  -- الحصول على معرّف فئة "مرتبات"
  SELECT id INTO v_category_id FROM public.expense_categories WHERE name_ar = 'مرتبات' LIMIT 1;
  -- الحصول على اسم الموظف
  SELECT employee_name INTO v_employee_name FROM public.salaries WHERE id = NEW.salary_id;
  
  -- إدراج معاملة مصروف جديدة
  INSERT INTO public.transactions (date, type, category_id, amount, description)
  VALUES (
    NEW.payment_date,
    'expense',
    v_category_id,
    NEW.amount_paid,
    'راتب الموظف: ' || v_employee_name
  );
  RETURN NEW;
END;
$$;

-- ربط الدالة بجدول مدفوعات الرواتب
CREATE TRIGGER on_salary_payment_create_transaction
AFTER INSERT ON public.salary_payments
FOR EACH ROW EXECUTE FUNCTION public.handle_new_salary_payment_transaction();