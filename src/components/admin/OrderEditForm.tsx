import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { Order, OrderStatus } from '@/types/supabase';
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
import { showSuccess, showError, showLoading, dismissToast } from '@/utils/toast';
import { Loader2 } from 'lucide-react';

const orderEditSchema = z.object({
    customer_name: z.string().min(2, "الاسم مطلوب"),
    customer_phone: z.string().regex(/^01[0125][0-9]{8}$/, "رقم الهاتف غير صحيح"),
    customer_address: z.string().min(10, "العنوان التفصيلي مطلوب"),
    status: z.enum(['pending', 'processing', 'shipped', 'completed', 'cancelled']),
    cancel_reason: z.string().optional(),
}).refine(data => {
    if (data.status === 'cancelled') {
        return data.cancel_reason && data.cancel_reason.trim().length > 0;
    }
    return true;
}, {
    message: "سبب الإلغاء مطلوب عند إلغاء الطلب",
    path: ["cancel_reason"],
});

type OrderEditFormData = z.infer<typeof orderEditSchema>;

interface OrderEditFormProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    order: Order | null;
}

const statusLabels: Record<OrderStatus, string> = {
    pending: 'جديد',
    processing: 'قيد التجهيز',
    shipped: 'تم الشحن',
    completed: 'مكتمل',
    cancelled: 'ملغي',
};

const OrderEditForm = ({ isOpen, setIsOpen, order }: OrderEditFormProps) => {
    const queryClient = useQueryClient();
    
    const form = useForm<OrderEditFormData>({
        resolver: zodResolver(orderEditSchema),
    });

    const watchedStatus = form.watch('status');

    useEffect(() => {
        if (order) {
            form.reset({
                customer_name: order.customer_name,
                customer_phone: order.customer_phone,
                customer_address: order.customer_address,
                status: order.status,
                cancel_reason: order.cancel_reason || '',
            });
        }
    }, [order, form.reset]);

    const onSubmit = async (data: OrderEditFormData) => {
        if (!order) return;

        const toastId = showLoading("جاري تحديث الطلب...");
        const originalStatus = order.status;
        const newStatus = data.status;

        const updateData: Partial<Order> = {
            customer_name: data.customer_name,
            customer_phone: data.customer_phone,
            customer_address: data.customer_address,
            status: newStatus,
            cancel_reason: newStatus === 'cancelled' ? data.cancel_reason : null,
        };

        const { error } = await supabase
            .from('orders')
            .update(updateData)
            .eq('id', order.id);

        if (error) {
            dismissToast(toastId);
            showError(`حدث خطأ: ${error.message}`);
        } else {
            dismissToast(toastId);
            showSuccess(`تم تحديث الطلب بنجاح.`);
            
            if (originalStatus !== newStatus) {
                if (originalStatus === 'pending' && newStatus === 'processing') {
                    const stockToastId = showLoading('جاري خصم الكميات من المخزون...');
                    const { error: stockError } = await supabase.rpc('deduct_stock_for_order', { p_order_id: order.id });
                    dismissToast(stockToastId);
                    if (stockError) {
                        showError(`فشل خصم المخزون: ${stockError.message}`);
                    } else {
                        showSuccess('تم خصم المخزون بنجاح.');
                        queryClient.invalidateQueries({ queryKey: ['inventoryCoffee'] });
                        queryClient.invalidateQueries({ queryKey: ['inventoryAdditives'] });
                        queryClient.invalidateQueries({ queryKey: ['inventoryForAlerts'] });
                    }
                }
                
                if (order.user_id) {
                    try {
                        const { data: template } = await supabase
                            .from('notification_templates')
                            .select('*')
                            .eq('status', newStatus)
                            .eq('is_active', true)
                            .single();

                        if (template) {
                            const title = template.title_template.replace('{customer_name}', order.customer_name).replace('{blend_name}', order.blend_name).replace('{order_id_short}', order.id.substring(0, 8));
                            const body = template.body_template.replace('{customer_name}', order.customer_name).replace('{blend_name}', order.blend_name).replace('{order_id_short}', order.id.substring(0, 8));
                            supabase.functions.invoke('notify-customer', { body: { user_id: order.user_id, payload: { title, body } } });
                        }
                    } catch (e) {
                        console.error("Error processing push notification:", e);
                    }
                }
            }

            queryClient.invalidateQueries({ queryKey: ['orders'] });
            setIsOpen(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-lg" dir="rtl">
                <DialogHeader>
                    <DialogTitle>تعديل الطلب</DialogTitle>
                    <DialogDescription>
                        تعديل تفاصيل طلب العميل: {order?.customer_name}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto p-2">
                        <FormField name="customer_name" control={form.control} render={({ field }) => <FormItem><FormLabel>اسم العميل</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                        <FormField name="customer_phone" control={form.control} render={({ field }) => <FormItem><FormLabel>رقم الهاتف</FormLabel><FormControl><Input dir="ltr" {...field} /></FormControl><FormMessage /></FormItem>} />
                        <FormField name="customer_address" control={form.control} render={({ field }) => <FormItem><FormLabel>العنوان</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>} />
                        
                        <FormField control={form.control} name="status" render={({ field }) => (
                            <FormItem>
                                <FormLabel>حالة الطلب</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {Object.entries(statusLabels).map(([key, label]) => (
                                            <SelectItem key={key} value={key}>{label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />

                        {watchedStatus === 'cancelled' && (
                            <FormField name="cancel_reason" control={form.control} render={({ field }) => <FormItem><FormLabel>سبب الإلغاء</FormLabel><FormControl><Textarea placeholder="اذكر سبب إلغاء الطلب..." {...field} /></FormControl><FormMessage /></FormItem>} />
                        )}

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>إلغاء</Button>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                                حفظ التغييرات
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default OrderEditForm;