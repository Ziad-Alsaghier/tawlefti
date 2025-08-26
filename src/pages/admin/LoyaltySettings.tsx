import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Loader2, Save, Star } from 'lucide-react';
import { showSuccess, showError, showLoading, dismissToast } from '@/utils/toast';

const fetchLoyaltySettings = async () => {
    const { data, error } = await supabase.from('store_settings').select('value').eq('key', 'loyalty_rules').single();
    if (error && error.code !== 'PGRST116') throw error; // Ignore 'not found' error
    return data?.value || { earn_rate: 1, redeem_rate: 10 };
};

const loyaltySchema = z.object({
    earn_rate: z.coerce.number().min(0, "المعدل يجب أن يكون رقمًا موجبًا"),
    redeem_rate: z.coerce.number().positive("المعدل يجب أن يكون أكبر من صفر"),
});

type LoyaltyFormData = z.infer<typeof loyaltySchema>;

const LoyaltySettings = () => {
    const queryClient = useQueryClient();
    const { data: loyaltySettings, isLoading } = useQuery({
        queryKey: ['loyaltySettings'],
        queryFn: fetchLoyaltySettings,
    });

    const form = useForm<LoyaltyFormData>({
        resolver: zodResolver(loyaltySchema),
    });

    useEffect(() => {
        if (loyaltySettings) {
            form.reset(loyaltySettings);
        }
    }, [loyaltySettings, form.reset]);

    const onSubmit = async (data: LoyaltyFormData) => {
        const toastId = showLoading("جاري حفظ الإعدادات...");
        
        const { error } = await supabase.from('store_settings').upsert({ 
            key: 'loyalty_rules', 
            value: data 
        }, { onConflict: 'key' });

        dismissToast(toastId);
        if (error) {
            showError(`فشل حفظ الإعدادات: ${error.message}`);
        } else {
            showSuccess("تم حفظ إعدادات برنامج الولاء بنجاح.");
            queryClient.invalidateQueries({ queryKey: ['loyaltySettings'] });
            queryClient.invalidateQueries({ queryKey: ['storeSettings'] });
        }
    };

    if (isLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <div className="space-y-8 max-w-2xl mx-auto">
            <div className="text-center">
                <h1 className="text-3xl font-bold">إعدادات برنامج الولاء</h1>
                <p className="text-muted-foreground mt-2">
                    تحكم في كيفية اكتساب واستبدال النقاط في متجرك.
                </p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Star /> قواعد برنامج الولاء</CardTitle>
                            <CardDescription>حدد كيفية اكتساب واستبدال النقاط في متجرك.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField control={form.control} name="earn_rate" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>النقاط المكتسبة لكل جنيه</FormLabel>
                                    <FormControl><Input type="number" step="0.1" {...field} /></FormControl>
                                    <FormDescription>كم نقطة يحصل عليها العميل مقابل كل جنيه ينفقه.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="redeem_rate" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>عدد النقاط لكل جنيه خصم</FormLabel>
                                    <FormControl><Input type="number" step="1" {...field} /></FormControl>
                                    <FormDescription>كم نقطة يحتاجها العميل للحصول على خصم 1 جنيه.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </CardContent>
                    </Card>

                    <div className="flex justify-end">
                        <Button type="submit" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Save className="ml-2 h-4 w-4" />}
                            حفظ الإعدادات
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
};

export default LoyaltySettings;