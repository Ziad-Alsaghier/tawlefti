import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { OrderStatus } from '@/types/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Loader2, Save, Info, Tag, Send } from 'lucide-react';
import { showSuccess, showError, showLoading, dismissToast } from '@/utils/toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const templateSchema = z.object({
    status: z.string(),
    is_active: z.boolean(),
    title_template: z.string().min(1, "العنوان مطلوب"),
    body_template: z.string().min(1, "محتوى الرسالة مطلوب"),
});

const formSchema = z.object({
    templates: z.array(templateSchema),
});

const broadcastSchema = z.object({
    title: z.string().min(3, "العنوان يجب أن يكون 3 أحرف على الأقل"),
    body: z.string().min(10, "الرسالة يجب أن تكون 10 أحرف على الأقل"),
});

type Template = z.infer<typeof templateSchema>;

const fetchNotificationTemplates = async (): Promise<Template[]> => {
    const { data, error } = await supabase.from('notification_templates').select('*');
    if (error) throw error;
    return data;
};

const statusLabels: Record<OrderStatus, string> = {
    pending: 'جديد',
    processing: 'قيد التجهيز',
    shipped: 'تم الشحن',
    completed: 'مكتمل',
    cancelled: 'ملغي',
};

const BroadcastCard = () => {
    const [isSending, setIsSending] = useState(false);
    const broadcastForm = useForm<z.infer<typeof broadcastSchema>>({
        resolver: zodResolver(broadcastSchema),
    });

    const handleBroadcast = async (values: z.infer<typeof broadcastSchema>) => {
        setIsSending(true);
        const toastId = showLoading("جاري إرسال الإشعار لجميع المشتركين...");

        const { data, error } = await supabase.functions.invoke('broadcast-notifications', {
            body: { payload: values },
        });

        dismissToast(toastId);
        setIsSending(false);

        if (error) {
            showError(`فشل الإرسال: ${error.message}`);
        } else {
            showSuccess(`تم إرسال الإشعار بنجاح إلى ${data.count || 0} مشترك.`);
            broadcastForm.reset({ title: '', body: '' });
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>إرسال إشعار عام</CardTitle>
                <CardDescription>
                    أرسل إشعارًا تسويقيًا أو إعلانًا لجميع المستخدمين الذين وافقوا على استقبال الإشعارات.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...broadcastForm}>
                    <form onSubmit={broadcastForm.handleSubmit(handleBroadcast)} className="space-y-4">
                        <FormField
                            control={broadcastForm.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>عنوان الإشعار</FormLabel>
                                    <FormControl><Input placeholder="عرض جديد ومميز!" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={broadcastForm.control}
                            name="body"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>محتوى الرسالة</FormLabel>
                                    <FormControl><Textarea placeholder="لا تفوت خصوماتنا الحصرية على توليفات الإسبريسو..." {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={isSending}>
                            {isSending ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Send className="ml-2 h-4 w-4" />}
                            إرسال الآن
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
};

const NotificationsManager = () => {
    const queryClient = useQueryClient();
    const { data: templates, isLoading } = useQuery({
        queryKey: ['notificationTemplates'],
        queryFn: fetchNotificationTemplates,
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    });

    const { fields } = useFieldArray({
        control: form.control,
        name: "templates",
    });

    useEffect(() => {
        if (templates) {
            const allStatuses: OrderStatus[] = ['pending', 'processing', 'shipped', 'completed', 'cancelled'];
            const formValues = allStatuses.map(status => {
                const existing = templates.find(t => t.status === status);
                return existing || {
                    status,
                    is_active: false,
                    title_template: '',
                    body_template: '',
                };
            });
            form.reset({ templates: formValues });
        }
    }, [templates, form.reset]);

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        const toastId = showLoading("جاري حفظ القوالب...");
        const { error } = await supabase.from('notification_templates').upsert(data.templates);
        dismissToast(toastId);
        if (error) {
            showError(`فشل الحفظ: ${error.message}`);
        } else {
            showSuccess("تم حفظ قوالب الإشعارات بنجاح.");
            queryClient.invalidateQueries({ queryKey: ['notificationTemplates'] });
        }
    };

    if (isLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold">إدارة الإشعارات</h1>
                <p className="text-muted-foreground mt-2">
                    أرسل إشعارات تسويقية وتحكم في محتوى الإشعارات التلقائية عند تغيير حالة الطلبات.
                </p>
            </div>

            <BroadcastCard />

            <Card>
                <CardHeader>
                    <CardTitle>قوالب الإشعارات التلقائية</CardTitle>
                    <CardDescription>
                        هذه هي الرسائل التي يتم إرسالها تلقائيًا للعميل عند تغيير حالة طلبه.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Alert>
                        <Info className="h-4 w-4" />
                        <AlertTitle>كيفية استخدام المتغيرات</AlertTitle>
                        <AlertDescription>
                            يمكنك استخدام المتغيرات التالية ليتم استبدالها تلقائيًا بمعلومات الطلب:
                            <div className="flex flex-wrap gap-4 mt-2 text-xs">
                                <span className="flex items-center gap-1"><Tag className="h-3 w-3" /> <code>{'{customer_name}'}</code></span>
                                <span className="flex items-center gap-1"><Tag className="h-3 w-3" /> <code>{'{blend_name}'}</code></span>
                                <span className="flex items-center gap-1"><Tag className="h-3 w-3" /> <code>{'{order_id_short}'}</code></span>
                            </div>
                        </AlertDescription>
                    </Alert>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {fields.map((field, index) => (
                                    <Card key={field.id} className="bg-muted/50">
                                        <CardHeader>
                                            <div className="flex justify-between items-center">
                                                <CardTitle>{statusLabels[field.status as OrderStatus]}</CardTitle>
                                                <FormField
                                                    control={form.control}
                                                    name={`templates.${index}.is_active`}
                                                    render={({ field }) => (
                                                        <FormItem className="flex items-center gap-2 space-y-0">
                                                            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                                            <FormLabel>مفعل</FormLabel>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <FormField
                                                control={form.control}
                                                name={`templates.${index}.title_template`}
                                                render={({ field }) => (
                                                    <FormItem><FormLabel>عنوان الإشعار</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name={`templates.${index}.body_template`}
                                                render={({ field }) => (
                                                    <FormItem><FormLabel>محتوى الإشعار</FormLabel><FormControl><Textarea {...field} rows={3} /></FormControl><FormMessage /></FormItem>
                                                )}
                                            />
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                            <div className="flex justify-end pt-4">
                                <Button type="submit" disabled={form.formState.isSubmitting}>
                                    {form.formState.isSubmitting ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Save className="ml-2 h-4 w-4" />}
                                    حفظ كل القوالب
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
};

export default NotificationsManager;