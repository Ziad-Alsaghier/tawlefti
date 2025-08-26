import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
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
import { showSuccess, showError } from '@/utils/toast';
import { Loader2 } from 'lucide-react';

const categorySchema = z.object({
    name_ar: z.string().min(2, "الاسم العربي مطلوب"),
    name_en: z.string().min(2, "English name is required"),
    description_ar: z.string().optional(),
    description_en: z.string().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryFormProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    category: ExpenseCategory | null;
}

const CategoryForm = ({ isOpen, setIsOpen, category }: CategoryFormProps) => {
    const queryClient = useQueryClient();
    
    const form = useForm<CategoryFormData>({
        resolver: zodResolver(categorySchema),
    });

    useEffect(() => {
        if (isOpen) {
            if (category) {
                form.reset(category);
            } else {
                form.reset({
                    name_ar: '',
                    name_en: '',
                    description_ar: '',
                    description_en: '',
                });
            }
        }
    }, [category, isOpen, form.reset]);

    const onSubmit = async (data: CategoryFormData) => {
        const { error } = await supabase.from('expense_categories').upsert(
            category ? { ...data, id: category.id } : data
        );

        if (error) {
            showError(`حدث خطأ: ${error.message}`);
        } else {
            showSuccess(`تم ${category ? 'تحديث' : 'إنشاء'} الفئة بنجاح.`);
            queryClient.invalidateQueries({ queryKey: ['expense_categories'] });
            setIsOpen(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-md" dir="rtl">
                <DialogHeader>
                    <DialogTitle>{category ? 'تعديل فئة مصروفات' : 'إضافة فئة مصروفات جديدة'}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField name="name_ar" control={form.control} render={({ field }) => <FormItem><FormLabel>الاسم (عربي)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                        <FormField name="name_en" control={form.control} render={({ field }) => <FormItem><FormLabel>الاسم (إنجليزي)</FormLabel><FormControl><Input dir="ltr" {...field} /></FormControl><FormMessage /></FormItem>} />
                        <FormField name="description_ar" control={form.control} render={({ field }) => <FormItem><FormLabel>الوصف (عربي)</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>} />
                        <FormField name="description_en" control={form.control} render={({ field }) => <FormItem><FormLabel>الوصف (إنجليزي)</FormLabel><FormControl><Textarea dir="ltr" {...field} /></FormControl><FormMessage /></FormItem>} />
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>إلغاء</Button>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                                {category ? 'حفظ التغييرات' : 'إنشاء'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default CategoryForm;