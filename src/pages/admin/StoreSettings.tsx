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
import { Loader2, PlusCircle, Trash2 } from 'lucide-react';
import { showSuccess, showError, showLoading, dismissToast } from '@/utils/toast';

const fetchStoreSettings = async () => {
    const { data, error } = await supabase.from('store_settings').select('*');
    if (error) throw error;
    const settings: Record<string, any> = {};
    data.forEach(item => {
        settings[item.key] = item.value;
    });
    return settings;
};

const settingsSchema = z.object({
    operating_hours: z.object({
        open: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "صيغة الوقت غير صحيحة (HH:MM)"),
        close: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "صيغة الوقت غير صحيحة (HH:MM)"),
    }),
    delivery_slots: z.object({
        slots: z.array(z.object({ value: z.string().min(1, "فترة التوصيل لا يمكن أن تكون فارغة") }))
    }),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

const StoreSettings = () => {
    const queryClient = useQueryClient();
    const { data: settings, isLoading } = useQuery({
        queryKey: ['storeSettings'],
        queryFn: fetchStoreSettings,
    });

    const form = useForm<SettingsFormData>({
        resolver: zodResolver(settingsSchema),
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "delivery_slots.slots",
    });

    useEffect(() => {
        if (settings) {
            form.reset({
                operating_hours: settings.operating_hours || { open: '09:00', close: '01:00' },
                delivery_slots: {
                    slots: (settings.delivery_slots?.slots || []).map((s: string) => ({ value: s }))
                },
            });
        }
    }, [settings, form.reset]);

    const onSubmit = async (data: SettingsFormData) => {
        const toastId = showLoading("جاري حفظ الإعدادات...");
        
        const settingsToSave = [
            { key: 'operating_hours', value: data.operating_hours },
            { key: 'delivery_slots', value: { slots: data.delivery_slots.slots.map(s => s.value) } },
        ];

        const { error } = await supabase.from('store_settings').upsert(settingsToSave);

        dismissToast(toastId);
        if (error) {
            showError(`فشل حفظ الإعدادات: ${error.message}`);
        } else {
            showSuccess("تم حفظ الإعدادات بنجاح.");
            queryClient.invalidateQueries({ queryKey: ['storeSettings'] });
        }
    };

    if (isLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold">إعدادات المتجر</h1>
                <p className="text-muted-foreground mt-2">تحكم في مواعيد العمل وفترات التوصيل.</p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>مواعيد العمل</CardTitle>
                            <CardDescription>حدد ساعات العمل التي يتم فيها تحضير الطلبات فورًا.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField control={form.control} name="operating_hours.open" render={({ field }) => (
                                <FormItem><FormLabel>وقت الفتح</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="operating_hours.close" render={({ field }) => (
                                <FormItem><FormLabel>وقت الإغلاق</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>فترات التوصيل المتاحة</CardTitle>
                            <CardDescription>هذه الفترات ستظهر للعميل ليختار منها عند الطلب خارج مواعيد العمل.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {fields.map((field, index) => (
                                <div key={field.id} className="flex items-center gap-2">
                                    <FormField control={form.control} name={`delivery_slots.slots.${index}.value`} render={({ field }) => (
                                        <FormItem className="flex-grow"><FormControl><Input placeholder="مثال: 12:00 - 14:00" {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            ))}
                            <Button type="button" variant="outline" size="sm" onClick={() => append({ value: '' })}>
                                <PlusCircle className="ml-2 h-4 w-4" />
                                إضافة فترة جديدة
                            </Button>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end">
                        <Button type="submit" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                            حفظ الإعدادات
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
};

export default StoreSettings;