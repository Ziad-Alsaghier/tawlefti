import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Save, PlusCircle, Trash2 } from 'lucide-react';
import { showSuccess, showError, showLoading, dismissToast } from '@/utils/toast';

interface CostItem {
    label: string;
    value: number;
}

const fetchFixedCosts = async (): Promise<CostItem[]> => {
    const { data, error } = await supabase.from('store_settings').select('value').eq('key', 'fixed_costs').single();
    if (error && error.code !== 'PGRST116') throw error;
    // Ensure it returns an array, even if null or not an array
    if (Array.isArray(data?.value)) {
        return data.value;
    }
    // Default value if not found or in old format
    return [
        { label: 'التعبئة والتغليف', value: 10 },
        { label: 'الطحن', value: 5 },
        { label: 'الأكياس والمواد الأخرى', value: 5 },
        { label: 'التوصيل', value: 0 },
    ];
};

const costItemSchema = z.object({
    label: z.string().min(1, "اسم البند مطلوب"),
    value: z.coerce.number().min(0, "التكلفة يجب أن تكون رقمًا موجبًا"),
});

const costsSchema = z.object({
    costs: z.array(costItemSchema),
});

type CostsFormData = z.infer<typeof costsSchema>;

const FixedCostsManager = () => {
    const queryClient = useQueryClient();
    const { data: fixedCosts, isLoading } = useQuery({
        queryKey: ['fixedCosts'],
        queryFn: fetchFixedCosts,
    });

    const form = useForm<CostsFormData>({
        resolver: zodResolver(costsSchema),
        defaultValues: {
            costs: []
        }
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "costs",
    });

    useEffect(() => {
        if (fixedCosts) {
            form.reset({ costs: fixedCosts });
        }
    }, [fixedCosts, form.reset]);

    const onSubmit = async (data: CostsFormData) => {
        const toastId = showLoading("جاري حفظ التكاليف...");
        
        const { error } = await supabase.from('store_settings').upsert({ 
            key: 'fixed_costs', 
            value: data.costs 
        }, { onConflict: 'key' });

        dismissToast(toastId);
        if (error) {
            showError(`فشل حفظ التكاليف: ${error.message}`);
        } else {
            showSuccess("تم حفظ التكاليف الثابتة بنجاح.");
            queryClient.invalidateQueries({ queryKey: ['fixedCosts'] });
            queryClient.invalidateQueries({ queryKey: ['storeSettings'] });
        }
    };

    if (isLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <div className="space-y-8 max-w-2xl mx-auto">
            <div className="text-center">
                <h1 className="text-3xl font-bold">إدارة التكاليف الثابتة</h1>
                <p className="text-muted-foreground mt-2">
                    تحكم في التكاليف المضافة لكل طلب. هذه القيم ستؤثر مباشرة على حساب سعر البيع والأرباح.
                </p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>بنود التكاليف</CardTitle>
                            <CardDescription>أضف أو عدل أو احذف بنود التكاليف الثابتة لكل طلب.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {fields.map((field, index) => (
                                <div key={field.id} className="flex items-end gap-2 p-4 border rounded-lg bg-muted/50">
                                    <FormField
                                        control={form.control}
                                        name={`costs.${index}.label`}
                                        render={({ field }) => (
                                            <FormItem className="flex-grow">
                                                <FormLabel>اسم البند</FormLabel>
                                                <FormControl><Input placeholder="مثال: التوصيل" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`costs.${index}.value`}
                                        render={({ field }) => (
                                            <FormItem className="w-32">
                                                <FormLabel>التكلفة (جنيه)</FormLabel>
                                                <FormControl><Input type="number" step="0.5" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            ))}
                             <Button type="button" variant="outline" size="sm" onClick={() => append({ label: '', value: 0 })}>
                                <PlusCircle className="ml-2 h-4 w-4" />
                                إضافة بند تكلفة جديد
                            </Button>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end">
                        <Button type="submit" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Save className="ml-2 h-4 w-4" />}
                            حفظ التغييرات
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
};

export default FixedCostsManager;