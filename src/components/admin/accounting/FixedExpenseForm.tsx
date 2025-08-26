import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FixedExpense, ExpenseCategory } from '@/types/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { showSuccess, showError } from '@/utils/toast';
import { Loader2 } from 'lucide-react';
import { fetchExpenseCategories } from '@/queries/admin';

const fixedExpenseSchema = z.object({
    name: z.string().min(2, "اسم المصروف مطلوب"),
    amount: z.coerce.number().positive("المبلغ يجب أن يكون أكبر من صفر"),
    category_id: z.string().uuid("يجب اختيار فئة صحيحة").optional().nullable(),
    frequency: z.enum(['monthly', 'quarterly', 'yearly'], { required_error: "يجب اختيار دورية الدفع" }),
});

type FixedExpenseFormData = z.infer<typeof fixedExpenseSchema>;

interface FixedExpenseFormProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    expense: FixedExpense | null;
}

const FixedExpenseForm = ({ isOpen, setIsOpen, expense }: FixedExpenseFormProps) => {
    const queryClient = useQueryClient();
    const form = useForm<FixedExpenseFormData>({ resolver: zodResolver(fixedExpenseSchema) });

    const { data: categories, isLoading: isLoadingCategories } = useQuery({
        queryKey: ['expense_categories'],
        queryFn: fetchExpenseCategories,
        enabled: isOpen,
    });

    useEffect(() => {
        if (isOpen) {
            if (expense) {
                form.reset(expense);
            } else {
                form.reset({ name: '', amount: 0, category_id: null, frequency: 'monthly' });
            }
        }
    }, [expense, isOpen, form.reset]);

    const onSubmit = async (data: FixedExpenseFormData) => {
        const { error } = await supabase.from('fixed_expenses').upsert(
            expense ? { ...data, id: expense.id } : data
        );

        if (error) {
            showError(`حدث خطأ: ${error.message}`);
        } else {
            showSuccess(`تم ${expense ? 'تحديث' : 'إنشاء'} المصروف الثابت بنجاح.`);
            queryClient.invalidateQueries({ queryKey: ['fixed_expenses'] });
            setIsOpen(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-md" dir="rtl">
                <DialogHeader>
                    <DialogTitle>{expense ? 'تعديل مصروف ثابت' : 'إضافة مصروف ثابت جديد'}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField name="name" control={form.control} render={({ field }) => <FormItem><FormLabel>اسم المصروف</FormLabel><FormControl><Input placeholder="مثال: إيجار المحل" {...field} /></FormControl><FormMessage /></FormItem>} />
                        <FormField name="amount" control={form.control} render={({ field }) => <FormItem><FormLabel>المبلغ (بالجنيه)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>} />
                        <FormField control={form.control} name="category_id" render={({ field }) => (
                            <FormItem>
                                <FormLabel>الفئة</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value || ''} disabled={isLoadingCategories}>
                                    <FormControl><SelectTrigger><SelectValue placeholder={isLoadingCategories ? "جاري التحميل..." : "اختر فئة..."} /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {categories?.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name_ar}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="frequency" render={({ field }) => (
                            <FormItem>
                                <FormLabel>دورية الدفع</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="monthly">شهريًا</SelectItem>
                                        <SelectItem value="quarterly">ربع سنويًا</SelectItem>
                                        <SelectItem value="yearly">سنويًا</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>إلغاء</Button>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                                {expense ? 'حفظ التغييرات' : 'إنشاء'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default FixedExpenseForm;