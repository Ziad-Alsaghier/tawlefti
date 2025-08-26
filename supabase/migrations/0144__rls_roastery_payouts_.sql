-- حذف السياسات الحالية لجدول roastery_payouts
DROP POLICY IF EXISTS "Allow authenticated users to insert roastery_payouts" ON public.roastery_payouts;
DROP POLICY IF EXISTS "Allow authenticated users to select roastery_payouts" ON public.roastery_payouts;

-- إنشاء سياسة جديدة للسماح بالاستعلام (SELECT) فقط للمستخدمين ذوي صلاحية 'admin' أو 'roaster'
CREATE POLICY "Admins and roasters can view roastery_payouts"
ON public.roastery_payouts
FOR SELECT
USING (get_user_role() IN ('admin', 'roaster'));

-- إنشاء سياسة جديدة للسماح بالإدخال (INSERT) فقط للمستخدمين ذوي صلاحية 'admin' أو 'roaster'
CREATE POLICY "Admins and roasters can insert roastery_payouts"
ON public.roastery_payouts
FOR INSERT
WITH CHECK (get_user_role() IN ('admin', 'roaster'));