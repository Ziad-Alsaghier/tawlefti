-- 1. إنشاء جدول الموردين
CREATE TABLE public.suppliers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    contact_person TEXT,
    phone TEXT,
    email TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- تفعيل RLS لحماية جدول الموردين
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

-- سياسة RLS للسماح للمديرين فقط بإدارة الموردين
CREATE POLICY "Admins can manage suppliers" ON public.suppliers
FOR ALL TO authenticated
USING (get_user_role() = 'admin'::text)
WITH CHECK (get_user_role() = 'admin'::text);

-- 2. تحديث جدول المشتريات لربطه بالموردين
ALTER TABLE public.purchases
ADD COLUMN supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL;

-- 3. إنشاء جدول المصروفات الثابتة
CREATE TABLE public.fixed_expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    category_id UUID REFERENCES public.expense_categories(id) ON DELETE SET NULL,
    frequency TEXT NOT NULL, -- e.g., 'monthly', 'yearly'
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- تفعيل RLS لحماية جدول المصروفات الثابتة
ALTER TABLE public.fixed_expenses ENABLE ROW LEVEL SECURITY;

-- سياسة RLS للسماح للمديرين فقط بإدارة المصروفات الثابتة
CREATE POLICY "Admins can manage fixed expenses" ON public.fixed_expenses
FOR ALL TO authenticated
USING (get_user_role() = 'admin'::text)
WITH CHECK (get_user_role() = 'admin'::text);

-- 4. تحديث دالة تسجيل المشتريات لتستخدم معرّف المورد
CREATE OR REPLACE FUNCTION public.add_purchase_and_update_stock(
    p_item_type text, 
    p_item_code text, 
    p_quantity numeric, 
    p_cost numeric, 
    p_supplier_id uuid, -- Changed from p_supplier text
    p_notes text
)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_supplier_name TEXT;
BEGIN
    -- Get supplier name to store in the old column for compatibility
    SELECT name INTO v_supplier_name FROM public.suppliers WHERE id = p_supplier_id;

    -- Insert the purchase record
    INSERT INTO public.purchases(item_type, item_code, quantity, cost, supplier_id, supplier, notes)
    VALUES (p_item_type, p_item_code, p_quantity, p_cost, p_supplier_id, v_supplier_name, p_notes);

    -- Update the corresponding stock
    IF p_item_type = 'coffee' THEN
        UPDATE public.coffee_types
        SET stock_green_kg = stock_green_kg + p_quantity
        WHERE code = p_item_code;
    ELSIF p_item_type = 'additive' THEN
        UPDATE public.additives
        SET stock_grams = stock_grams + p_quantity
        WHERE id::text = p_item_code;
    END IF;
END;
$function$;