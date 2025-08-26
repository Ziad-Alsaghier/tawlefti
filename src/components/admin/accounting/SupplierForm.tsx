import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { Supplier } from '@/types/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { showSuccess, showError } from '@/utils/toast';
import { Loader2 } from 'lucide-react';

const supplierSchema = z.object({
    name: z.string().min(2, "اسم المورد مطلوب"),
    contact_person: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email("بريد إلكتروني غير صالح").optional().or(z.literal('')),
    notes: z.string().optional(),
});

type SupplierFormData = z.infer<typeof supplierSchema>;

interface SupplierFormProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    supplier: Supplier | null;
}

const SupplierForm = ({ isOpen, setIsOpen, supplier }: SupplierFormProps) => {
    const queryClient = useQueryClient();
    
    const form = useForm<SupplierFormData>({
        resolver: zodResolver(supplierSchema),
    });

    useEffect(() => {
        if (isOpen) {
            if (supplier) {
                form.reset(supplier);
            } else {
                form.reset({ name: '', contact_person: '', phone: '', email: '', notes: '' });
            }
        }
    }, [supplier, isOpen, form.reset]);

    const onSubmit = async (data: SupplierFormData) => {
        const { error } = await supabase.from('suppliers').upsert(
            supplier ? { ...data, id: supplier.id } : data
        );

        if (error) {
            showError(`حدث خطأ: ${error.message}`);
        } else {
            showSuccess(`تم ${supplier ? 'تحديث' : 'إنشاء'} المورد بنجاح.`);
            queryClient.invalidateQueries({ queryKey: ['suppliers'] });
            setIsOpen(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-md" dir="rtl">
                <DialogHeader>
                    <DialogTitle>{supplier ? 'تعديل مورد' : 'إضافة مورد جديد'}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField name="name" control={form.control} render={({ field }) => <FormItem><FormLabel>اسم المورد</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                        <FormField name="contact_person" control={form.control} render={({ field }) => <FormItem><FormLabel>شخص الاتصال</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                        <FormField name="phone" control={form.control} render={({ field }) => <FormItem><FormLabel>رقم الهاتف</FormLabel><FormControl><Input dir="ltr" {...field} /></FormControl><FormMessage /></FormItem>} />
                        <FormField name="email" control={form.control} render={({ field }) => <FormItem><FormLabel>البريد الإلكتروني</FormLabel><FormControl><Input dir="ltr" type="email" {...field} /></FormControl><FormMessage /></FormItem>} />
                        <FormField name="notes" control={form.control} render={({ field }) => <FormItem><FormLabel>ملاحظات</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>} />
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>إلغاء</Button>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                                {supplier ? 'حفظ التغييرات' : 'إنشاء'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default SupplierForm;