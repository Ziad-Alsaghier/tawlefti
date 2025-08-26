import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ExpenseCategory } from '@/types/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
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

const expenseSchema = z.object({
    date: z.string().min(1, "التاريخ مطلوب"),
    amount: z.coerce.number().positive("المبلغ يجب أن يكون أكبر من صفر"),
    category_id: z.string({ required_error: "يجب اختيار الفئة" }),
    description: z.string().min(3, "الوصف مطلوب"),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

interface ExpenseFormProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

const fetchCategories = async (): Promise<ExpenseCategory[]> => {
    const { data, error } = await supabase.from('expense_categories').select('*').order('name_ar');
    if (error) throw error;
    return data;
};

const ExpenseForm = ({ isOpen, setIsOpen }: ExpenseFormProps) => {
    const queryClient = useQueryClient();
    const form = useForm<ExpenseFormData>({
        resolver: zodResolver(expenseSchema),
        defaultValues: {
            date: new Date().toISOString().split('T')[0],
        }
    });

    const { data: categories, isLoading: isLoadingCategories } = useQuery({
        queryKey: ['expense_categories'],
        queryFn: fetchCategories,
        enabled: isOpen,
    });

    const onSubmit = async (data: ExpenseFormData) => {
        const { error } = await supabase.from('transactions').insert({
            ...data,
            type: 'expense',
        });

        if (error) {
            showError(`فشل تسجيل المصروف: ${error.message}`);
        } else {
            showSuccess('تم تسجيل المصروف بنجاح.');
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            setIsOpen(false);
            form.reset({ date: new Date().toISOString().split('T')[0] });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-md" dir="rtl">
                <DialogHeader>
                    <DialogTitle>تسجيل مصروف جديد</DialogTitle>
                    <DialogDescription>أدخل تفاصيل المصروف لتسجيله في دفتر الحسابات.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField name="date" control={form.control} render={({ field }) => <FormItem><FormLabel>التاريخ</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>} />
                        <FormField name="amount" control={form.control} render={({ field }) => <FormItem><FormLabel>المبلغ (بالجنيه)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>} />
                        <FormField control={form.control} name="category_id" render={({ field }) => (
                            <FormItem>
                                <FormLabel>الفئة</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingCategories}>
                                    <FormControl><SelectTrigger><SelectValue placeholder={isLoadingCategories ? "جاري التحميل..." : "اختر فئة..."} /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {categories?.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name_ar}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField name="description" control={form.control} render={({ field }) => <FormItem><FormLabel>الوصف</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>} />
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>إلغاء</Button>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                                حفظ المصروف
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default ExpenseForm;