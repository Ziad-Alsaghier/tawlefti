import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Order } from '@/types/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Loader2 } from 'lucide-react';

const costSchema = z.object({
    cost: z.coerce.number().positive("التكلفة يجب أن تكون أكبر من صفر"),
});

type CostFormData = z.infer<typeof costSchema>;

interface CostInputDialogProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    order: Order | null;
    onConfirm: (orderId: string, cost: number) => Promise<void>;
}

const CostInputDialog = ({ isOpen, setIsOpen, order, onConfirm }: CostInputDialogProps) => {
    const form = useForm<CostFormData>({
        resolver: zodResolver(costSchema),
    });

    const onSubmit = async (data: CostFormData) => {
        if (!order) return;
        await onConfirm(order.id, data.cost);
    };

    if (!order) return null;

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-md" dir="rtl">
                <DialogHeader>
                    <DialogTitle>إدخال التكلفة النهائية للطلب</DialogTitle>
                    <DialogDescription>
                        أدخل تكلفة هذا الطلب من المحمصة ليتم حساب الربح بدقة.
                        <br />
                        العميل: <span className="font-bold">{order.customer_name}</span>
                        <br />
                        التوليفة: <span className="font-bold">{order.blend_name}</span>
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            name="cost"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>تكلفة الطلب (بالجنيه)</FormLabel>
                                    <FormControl><Input type="number" step="0.5" {...field} autoFocus /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>إلغاء</Button>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                                تأكيد وإتمام الطلب
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default CostInputDialog;