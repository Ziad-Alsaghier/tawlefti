import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CoffeeType, Additive, Supplier } from '@/types/supabase';
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

const purchaseSchema = z.object({
    item_type: z.enum(['coffee', 'additive'], { required_error: "يجب اختيار نوع المادة" }),
    item_code: z.string({ required_error: "يجب اختيار المادة" }),
    quantity: z.coerce.number().positive("الكمية يجب أن تكون أكبر من صفر"),
    cost: z.coerce.number().min(0, "التكلفة لا يمكن أن تكون سالبة"),
    supplier_id: z.string().uuid("يجب اختيار مورد").optional().nullable(),
    notes: z.string().optional(),
});

type PurchaseFormData = z.infer<typeof purchaseSchema>;

interface PurchaseFormProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

const fetchCoffeeTypes = async (): Promise<CoffeeType[]> => {
    const { data, error } = await supabase.from('coffee_types').select('code, name_ar').order('name_ar');
    if (error) throw error;
    return data;
};

const fetchAdditives = async (): Promise<Additive[]> => {
    const { data, error } = await supabase.from('additives').select('id, name_ar').order('name_ar');
    if (error) throw error;
    return data;
};

const fetchSuppliers = async (): Promise<Supplier[]> => {
    const { data, error } = await supabase.from('suppliers').select('*').order('name');
    if (error) throw error;
    return data;
};

const PurchaseForm = ({ isOpen, setIsOpen }: PurchaseFormProps) => {
    const queryClient = useQueryClient();
    const form = useForm<PurchaseFormData>({ resolver: zodResolver(purchaseSchema) });
    const itemType = form.watch('item_type');

    const { data: coffeeTypes } = useQuery({ queryKey: ['allCoffeeTypes'], queryFn: fetchCoffeeTypes });
    const { data: additives } = useQuery({ queryKey: ['allAdditives'], queryFn: fetchAdditives });
    const { data: suppliers, isLoading: isLoadingSuppliers } = useQuery({ queryKey: ['suppliers'], queryFn: fetchSuppliers, enabled: isOpen });

    useEffect(() => {
        form.reset({ ...form.getValues(), item_code: undefined });
    }, [itemType, form.reset]);

    const onSubmit = async (data: PurchaseFormData) => {
        const { error } = await supabase.rpc('add_purchase_and_update_stock', {
            p_item_type: data.item_type,
            p_item_code: data.item_code,
            p_quantity: data.quantity,
            p_cost: data.cost,
            p_supplier_id: data.supplier_id || null,
            p_notes: data.notes || null,
        });

        if (error) {
            showError(`فشل تسجيل الشراء: ${error.message}`);
        } else {
            showSuccess('تم تسجيل الشراء وتحديث المخزون بنجاح.');
            queryClient.invalidateQueries({ queryKey: ['purchases'] });
            queryClient.invalidateQueries({ queryKey: ['inventoryCoffee'] });
            queryClient.invalidateQueries({ queryKey: ['inventoryAdditives'] });
            setIsOpen(false);
            form.reset();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-md" dir="rtl">
                <DialogHeader>
                    <DialogTitle>تسجيل عملية شراء جديدة</DialogTitle>
                    <DialogDescription>أدخل تفاصيل الشحنة الجديدة لتحديث المخزون.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto p-2">
                        <FormField control={form.control} name="item_type" render={({ field }) => (
                            <FormItem><FormLabel>نوع المادة</FormLabel><Select onValueChange={field.onChange}><FormControl><SelectTrigger><SelectValue placeholder="اختر..." /></SelectTrigger></FormControl><SelectContent><SelectItem value="coffee">بن</SelectItem><SelectItem value="additive">تحويجة</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                        )} />
                        
                        {itemType && <FormField control={form.control} name="item_code" render={({ field }) => (
                            <FormItem><FormLabel>اسم المادة</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="اختر..." /></SelectTrigger></FormControl><SelectContent>
                                {(itemType === 'coffee' ? coffeeTypes : additives)?.map(item => (
                                    <SelectItem key={'id' in item ? item.id : item.code} value={'id' in item ? item.id : item.code}>{item.name_ar}</SelectItem>
                                ))}
                            </SelectContent></Select><FormMessage /></FormItem>
                        )} />}

                        <FormField name="quantity" control={form.control} render={({ field }) => <FormItem><FormLabel>الكمية ({itemType === 'coffee' ? 'كجم' : 'جرام'})</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>} />
                        <FormField name="cost" control={form.control} render={({ field }) => <FormItem><FormLabel>التكلفة الإجمالية (جنيه)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>} />
                        
                        <FormField control={form.control} name="supplier_id" render={({ field }) => (
                            <FormItem>
                                <FormLabel>المورد (اختياري)</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value || ''} disabled={isLoadingSuppliers}>
                                    <FormControl><SelectTrigger><SelectValue placeholder={isLoadingSuppliers ? "جاري التحميل..." : "اختر مورد..."} /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {suppliers?.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField name="notes" control={form.control} render={({ field }) => <FormItem><FormLabel>ملاحظات (اختياري)</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>} />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>إلغاء</Button>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                                حفظ
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default PurchaseForm;