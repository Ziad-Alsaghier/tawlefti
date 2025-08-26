import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { DiscountCode } from '@/types/supabase';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { showSuccess, showError } from '@/utils/toast';
import { Loader2 } from 'lucide-react';

const discountSchema = z.object({
    code: z.string().min(3, "الكود يجب أن يكون 3 أحرف على الأقل").toUpperCase(),
    type: z.enum(['percentage', 'fixed'], { required_error: "يجب اختيار نوع الخصم" }),
    value: z.coerce.number().positive("قيمة الخصم يجب أن تكون أكبر من صفر"),
    expires_at: z.string().optional().nullable(),
    usage_limit: z.coerce.number().min(0).optional().nullable(),
    is_active: z.boolean().default(true),
});

type DiscountFormData = z.infer<typeof discountSchema>;

interface DiscountFormProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    discount: DiscountCode | null;
}

const DiscountForm = ({ isOpen, setIsOpen, discount }: DiscountFormProps) => {
    const queryClient = useQueryClient();
    
    const form = useForm<DiscountFormData>({
        resolver: zodResolver(discountSchema),
    });

    useEffect(() => {
        if (isOpen) {
            if (discount) {
                form.reset({
                    ...discount,
                    expires_at: discount.expires_at ? new Date(discount.expires_at).toISOString().substring(0, 16) : null,
                });
            } else {
                form.reset({
                    code: '',
                    type: 'percentage',
                    value: 0,
                    expires_at: null,
                    usage_limit: null,
                    is_active: true,
                });
            }
        }
    }, [discount, isOpen, form.reset]);

    const onSubmit = async (data: DiscountFormData) => {
        const dataToUpsert = {
            ...data,
            expires_at: data.expires_at ? new Date(data.expires_at).toISOString() : null,
            id: discount?.id,
        };

        const { error } = await supabase.from('discount_codes').upsert(dataToUpsert);

        if (error) {
            showError(`حدث خطأ: ${error.message}`);
        } else {
            showSuccess(`تم ${discount ? 'تحديث' : 'إنشاء'} كود الخصم بنجاح.`);
            queryClient.invalidateQueries({ queryKey: ['discounts'] });
            setIsOpen(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-md" dir="rtl">
                <DialogHeader>
                    <DialogTitle>{discount ? 'تعديل كود الخصم' : 'إضافة كود خصم جديد'}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField name="code" control={form.control} render={({ field }) => <FormItem><FormLabel>الكود</FormLabel><FormControl><Input dir="ltr" {...field} /></FormControl><FormMessage /></FormItem>} />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="type" render={({ field }) => (
                                <FormItem><FormLabel>النوع</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="percentage">نسبة مئوية (%)</SelectItem><SelectItem value="fixed">مبلغ ثابت (جنيه)</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                            )} />
                            <FormField name="value" control={form.control} render={({ field }) => <FormItem><FormLabel>القيمة</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>} />
                        </div>
                        <FormField name="expires_at" control={form.control} render={({ field }) => <FormItem><FormLabel>تاريخ الانتهاء (اختياري)</FormLabel><FormControl><Input type="datetime-local" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>} />
                        <FormField name="usage_limit" control={form.control} render={({ field }) => <FormItem><FormLabel>أقصى عدد استخدامات (اختياري)</FormLabel><FormControl><Input type="number" placeholder="اتركه فارغًا للاستخدام غير المحدود" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>} />
                        <FormField control={form.control} name="is_active" render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                <div className="space-y-0.5"><FormLabel>نشط</FormLabel></div>
                                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                            </FormItem>
                        )} />
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>إلغاء</Button>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                                {discount ? 'حفظ التغييرات' : 'إنشاء'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default DiscountForm;