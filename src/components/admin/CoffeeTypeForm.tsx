import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { CoffeeType } from '@/types/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { showSuccess, showError } from '@/utils/toast';
import { Loader2 } from 'lucide-react';

const coffeeTypeSchema = z.object({
    code: z.string().min(3, "الكود مطلوب (3 أحرف على الأقل)").regex(/^[a-z0-9_]+$/, "الكود يجب أن يحتوي على حروف إنجليزية صغيرة وأرقام وشرطة سفلية فقط"),
    name_ar: z.string().min(2, "الاسم العربي مطلوب"),
    name_en: z.string().min(2, "English name is required"),
    price_green_kg: z.coerce.number().min(0, "السعر يجب أن يكون رقمًا موجبًا"),
    price_light_kg: z.coerce.number().min(0, "السعر يجب أن يكون رقمًا موجبًا"),
    price_medium_kg: z.coerce.number().min(0, "السعر يجب أن يكون رقمًا موجبًا"),
    price_dark_kg: z.coerce.number().min(0, "السعر يجب أن يكون رقمًا موجبًا"),
    is_active: z.boolean().default(true),
});

type CoffeeTypeFormData = z.infer<typeof coffeeTypeSchema>;

interface CoffeeTypeFormProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    coffeeType: CoffeeType | null;
}

const CoffeeTypeForm = ({ isOpen, setIsOpen, coffeeType }: CoffeeTypeFormProps) => {
    const queryClient = useQueryClient();
    
    const form = useForm<CoffeeTypeFormData>({
        resolver: zodResolver(coffeeTypeSchema),
        defaultValues: { 
            is_active: true, 
            price_green_kg: 0,
            price_light_kg: 0,
            price_medium_kg: 0,
            price_dark_kg: 0,
        },
    });

    useEffect(() => {
        if (isOpen) {
            if (coffeeType) {
                form.reset(coffeeType);
            } else {
                form.reset({
                    code: '',
                    name_ar: '',
                    name_en: '',
                    price_green_kg: 0,
                    price_light_kg: 0,
                    price_medium_kg: 0,
                    price_dark_kg: 0,
                    is_active: true,
                });
            }
        }
    }, [coffeeType, isOpen, form.reset]);

    const onSubmit = async (data: CoffeeTypeFormData) => {
        const { error } = await supabase.from('coffee_types').upsert(data, { onConflict: 'code' });

        if (error) {
            showError(`حدث خطأ: ${error.message}`);
        } else {
            showSuccess(`تم ${coffeeType ? 'تحديث' : 'إنشاء'} نوع البن بنجاح.`);
            queryClient.invalidateQueries({ queryKey: ['coffeeTypes'] });
            setIsOpen(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-md" dir="rtl">
                <DialogHeader>
                    <DialogTitle>{coffeeType ? 'تعديل نوع البن' : 'إضافة نوع بن جديد'}</DialogTitle>
                    <DialogDescription>املأ التفاصيل أدناه.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto p-2">
                        <FormField name="code" control={form.control} render={({ field }) => <FormItem><FormLabel>الكود (Code)</FormLabel><FormControl><Input dir="ltr" {...field} disabled={!!coffeeType} /></FormControl><FormDescription>معرّف فريد. لا يمكن تغييره بعد الإنشاء.</FormDescription><FormMessage /></FormItem>} />
                        <FormField name="name_ar" control={form.control} render={({ field }) => <FormItem><FormLabel>الاسم (عربي)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                        <FormField name="name_en" control={form.control} render={({ field }) => <FormItem><FormLabel>الاسم (إنجليزي)</FormLabel><FormControl><Input dir="ltr" {...field} /></FormControl><FormMessage /></FormItem>} />
                        
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                            <FormField name="price_green_kg" control={form.control} render={({ field }) => <FormItem><FormLabel>سعر الأخضر/كجم</FormLabel><FormControl><Input type="number" step="0.5" {...field} /></FormControl><FormMessage /></FormItem>} />
                            <FormField name="price_light_kg" control={form.control} render={({ field }) => <FormItem><FormLabel>سعر الفاتح/كجم</FormLabel><FormControl><Input type="number" step="0.5" {...field} /></FormControl><FormMessage /></FormItem>} />
                            <FormField name="price_medium_kg" control={form.control} render={({ field }) => <FormItem><FormLabel>سعر الوسط/كجم</FormLabel><FormControl><Input type="number" step="0.5" {...field} /></FormControl><FormMessage /></FormItem>} />
                            <FormField name="price_dark_kg" control={form.control} render={({ field }) => <FormItem><FormLabel>سعر الغامق/كجم</FormLabel><FormControl><Input type="number" step="0.5" {...field} /></FormControl><FormMessage /></FormItem>} />
                        </div>

                        <FormField control={form.control} name="is_active" render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                <div className="space-y-0.5"><FormLabel>نشط</FormLabel><FormDescription>هل هذا النوع متاح للاستخدام في التوليفات؟</FormDescription></div>
                                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                            </FormItem>
                        )} />
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>إلغاء</Button>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                                {coffeeType ? 'حفظ التغييرات' : 'إنشاء'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default CoffeeTypeForm;