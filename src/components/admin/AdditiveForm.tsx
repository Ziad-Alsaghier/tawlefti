import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { Additive } from '@/types/supabase';
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

const additiveSchema = z.object({
    name_ar: z.string().min(2, "الاسم العربي مطلوب"),
    name_en: z.string().min(2, "English name is required"),
    price_per_250g: z.coerce.number().min(0, "السعر يجب أن يكون رقمًا موجبًا"),
    cost_per_250g: z.coerce.number().min(0, "التكلفة يجب أن تكون رقمًا موجبًا"),
    is_active: z.boolean().default(true),
});

type AdditiveFormData = z.infer<typeof additiveSchema>;

interface AdditiveFormProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    additive: Additive | null;
}

const AdditiveForm = ({ isOpen, setIsOpen, additive }: AdditiveFormProps) => {
    const queryClient = useQueryClient();
    
    const form = useForm<AdditiveFormData>({
        resolver: zodResolver(additiveSchema),
        defaultValues: { is_active: true, price_per_250g: 0, cost_per_250g: 0 },
    });

    useEffect(() => {
        if (isOpen) {
            if (additive) {
                form.reset(additive);
            } else {
                form.reset({
                    name_ar: '',
                    name_en: '',
                    price_per_250g: 0,
                    cost_per_250g: 0,
                    is_active: true,
                });
            }
        }
    }, [additive, isOpen, form.reset]);

    const onSubmit = async (data: AdditiveFormData) => {
        const { error } = await supabase.from('additives').upsert(
            additive ? { ...data, id: additive.id } : data
        );

        if (error) {
            showError(`حدث خطأ: ${error.message}`);
        } else {
            showSuccess(`تم ${additive ? 'تحديث' : 'إنشاء'} التحويجة بنجاح.`);
            queryClient.invalidateQueries({ queryKey: ['additives'] });
            setIsOpen(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-md" dir="rtl">
                <DialogHeader>
                    <DialogTitle>{additive ? 'تعديل التحويجة' : 'إضافة تحويجة جديدة'}</DialogTitle>
                    <DialogDescription>املأ التفاصيل أدناه.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField name="name_ar" control={form.control} render={({ field }) => <FormItem><FormLabel>الاسم (عربي)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                        <FormField name="name_en" control={form.control} render={({ field }) => <FormItem><FormLabel>الاسم (إنجليزي)</FormLabel><FormControl><Input dir="ltr" {...field} /></FormControl><FormMessage /></FormItem>} />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField name="price_per_250g" control={form.control} render={({ field }) => <FormItem><FormLabel>سعر البيع / 250جم</FormLabel><FormControl><Input type="number" step="0.5" {...field} /></FormControl><FormMessage /></FormItem>} />
                            <FormField name="cost_per_250g" control={form.control} render={({ field }) => <FormItem><FormLabel>التكلفة / 250جم</FormLabel><FormControl><Input type="number" step="0.5" {...field} /></FormControl><FormMessage /></FormItem>} />
                        </div>
                        <FormField control={form.control} name="is_active" render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                <div className="space-y-0.5"><FormLabel>نشط</FormLabel><FormDescription>هل هذه التحويجة متاحة للعملاء؟</FormDescription></div>
                                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                            </FormItem>
                        )} />
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>إلغاء</Button>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                                {additive ? 'حفظ التغييرات' : 'إنشاء'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default AdditiveForm;