import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CoffeeType } from '@/types/supabase';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { showSuccess, showError, showLoading, dismissToast } from '@/utils/toast';
import { Loader2 } from 'lucide-react';

const fetchAvailableGreenCoffee = async (): Promise<CoffeeType[]> => {
    const { data, error } = await supabase
        .from('coffee_types')
        .select('*')
        .gt('stock_green_kg', 0)
        .eq('is_active', true)
        .order('name_ar');
    if (error) throw error;
    return data;
};

const roastSessionSchema = z.object({
    coffee_type_code: z.string({ required_error: "يجب اختيار نوع البن" }),
    green_kg_in: z.coerce.number().positive("الكمية يجب أن تكون أكبر من صفر"),
    roast_level: z.enum(['light', 'medium', 'dark'], { required_error: "يجب اختيار درجة التحميص" }),
});

type RoastSessionFormData = z.infer<typeof roastSessionSchema>;

interface RoastSessionFormProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

const RoastSessionForm = ({ isOpen, setIsOpen }: RoastSessionFormProps) => {
    const queryClient = useQueryClient();
    const form = useForm<RoastSessionFormData>({ resolver: zodResolver(roastSessionSchema) });

    const { data: coffeeTypes, isLoading } = useQuery({
        queryKey: ['availableGreenCoffee'],
        queryFn: fetchAvailableGreenCoffee,
        enabled: isOpen,
    });

    const onSubmit = async (data: RoastSessionFormData) => {
        const selectedCoffee = coffeeTypes?.find(c => c.code === data.coffee_type_code);
        if (selectedCoffee && data.green_kg_in > (selectedCoffee.stock_green_kg || 0)) {
            form.setError('green_kg_in', {
                type: 'manual',
                message: `الكمية المتاحة هي ${selectedCoffee.stock_green_kg?.toFixed(2) || 0} كجم فقط`,
            });
            return;
        }

        const toastId = showLoading('جاري معالجة جلسة التحميص...');
        const { error } = await supabase.rpc('process_roast_session', {
            p_coffee_code: data.coffee_type_code,
            p_green_kg_in: data.green_kg_in,
            p_roast_level: data.roast_level,
        });
        dismissToast(toastId);

        if (error) {
            showError(`فشل تسجيل الجلسة: ${error.message}`);
        } else {
            showSuccess('تم تسجيل جلسة التحميص وتحديث المخزون بنجاح.');
            queryClient.invalidateQueries({ queryKey: ['roastingSessions'] });
            queryClient.invalidateQueries({ queryKey: ['inventoryCoffee'] });
            queryClient.invalidateQueries({ queryKey: ['availableGreenCoffee'] });
            setIsOpen(false);
            form.reset();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-md" dir="rtl">
                <DialogHeader>
                    <DialogTitle>بدء جلسة تحميص جديدة</DialogTitle>
                    <DialogDescription>أدخل تفاصيل عملية التحميص لتحديث المخزون.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField control={form.control} name="coffee_type_code" render={({ field }) => (
                            <FormItem>
                                <FormLabel>نوع البن الأخضر</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder={isLoading ? "جاري التحميل..." : "اختر..."} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {coffeeTypes?.map(item => (
                                            <SelectItem key={item.code} value={item.code}>
                                                {item.name_ar} ({item.stock_green_kg?.toFixed(2)} كجم متاح)
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
                        
                        <FormField name="green_kg_in" control={form.control} render={({ field }) => (
                            <FormItem>
                                <FormLabel>الكمية الداخلة (كجم)</FormLabel>
                                <FormControl><Input type="number" step="0.1" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="roast_level" render={({ field }) => (
                            <FormItem>
                                <FormLabel>درجة التحميص</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="اختر..." /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="light">فاتح</SelectItem>
                                        <SelectItem value="medium">وسط</SelectItem>
                                        <SelectItem value="dark">غامق</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>إلغاء</Button>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                                بدء التحميص
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default RoastSessionForm;