import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Save, PlusCircle, Trash2 } from 'lucide-react';
import { showSuccess, showError, showLoading, dismissToast } from '@/utils/toast';
import { Separator } from '@/components/ui/separator';

const fetchSiteContent = async () => {
    const { data, error } = await supabase.from('site_content').select('*');
    if (error) throw error;
    const content: Record<string, any> = {};
    data.forEach(item => {
        content[item.key] = item.value;
    });
    return content;
};

const faqItemSchema = z.object({
    q_ar: z.string().min(1, "السؤال بالعربية مطلوب"),
    a_ar: z.string().min(1, "الإجابة بالعربية مطلوبة"),
    q_en: z.string().min(1, "Question in English is required"),
    a_en: z.string().min(1, "Answer in English is required"),
});

const contentSchema = z.object({
    about_us: z.object({
        title_ar: z.string().min(1),
        content_ar: z.string().min(1),
        title_en: z.string().min(1),
        content_en: z.string().min(1),
    }),
    contact_us: z.object({
        title_ar: z.string().min(1),
        content_ar: z.string().min(1),
        title_en: z.string().min(1),
        content_en: z.string().min(1),
    }),
    faq: z.object({
        title_ar: z.string().min(1),
        title_en: z.string().min(1),
        items: z.array(faqItemSchema),
    }),
});

const ContentManager = () => {
    const queryClient = useQueryClient();
    const { data: content, isLoading } = useQuery({
        queryKey: ['siteContentAdmin'],
        queryFn: fetchSiteContent,
    });

    const form = useForm<z.infer<typeof contentSchema>>({
        resolver: zodResolver(contentSchema),
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "faq.items",
    });

    useEffect(() => {
        if (content) {
            form.reset(content);
        }
    }, [content, form.reset]);

    const onSubmit = async (data: z.infer<typeof contentSchema>) => {
        const toastId = showLoading("جاري حفظ المحتوى...");
        const updates = Object.entries(data).map(([key, value]) => 
            supabase.from('site_content').upsert({ key, value }, { onConflict: 'key' })
        );
        
        const results = await Promise.all(updates);
        const hasError = results.some(res => res.error);

        dismissToast(toastId);
        if (hasError) {
            showError("حدث خطأ أثناء حفظ بعض البيانات.");
        } else {
            showSuccess("تم حفظ المحتوى بنجاح.");
            queryClient.invalidateQueries({ queryKey: ['siteContentAdmin'] });
            queryClient.invalidateQueries({ queryKey: ['siteContent'] });
        }
    };

    if (isLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold">إدارة محتوى الموقع</h1>
                <p className="text-muted-foreground mt-2">تحكم في النصوص المعروضة في صفحات "من نحن"، "اتصل بنا"، و"الأسئلة الشائعة".</p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <Card>
                        <CardHeader><CardTitle>صفحة "من نحن"</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <FormField control={form.control} name="about_us.title_ar" render={({ field }) => <FormItem><FormLabel>العنوان (عربي)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                            <FormField control={form.control} name="about_us.content_ar" render={({ field }) => <FormItem><FormLabel>المحتوى (عربي)</FormLabel><FormControl><Textarea {...field} rows={4} /></FormControl><FormMessage /></FormItem>} />
                            <Separator />
                            <FormField control={form.control} name="about_us.title_en" render={({ field }) => <FormItem><FormLabel>Title (English)</FormLabel><FormControl><Input {...field} dir="ltr" /></FormControl><FormMessage /></FormItem>} />
                            <FormField control={form.control} name="about_us.content_en" render={({ field }) => <FormItem><FormLabel>Content (English)</FormLabel><FormControl><Textarea {...field} rows={4} dir="ltr" /></FormControl><FormMessage /></FormItem>} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>صفحة "اتصل بنا"</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <FormField control={form.control} name="contact_us.title_ar" render={({ field }) => <FormItem><FormLabel>العنوان (عربي)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                            <FormField control={form.control} name="contact_us.content_ar" render={({ field }) => <FormItem><FormLabel>المحتوى (عربي)</FormLabel><FormControl><Textarea {...field} rows={3} /></FormControl><FormMessage /></FormItem>} />
                            <Separator />
                            <FormField control={form.control} name="contact_us.title_en" render={({ field }) => <FormItem><FormLabel>Title (English)</FormLabel><FormControl><Input {...field} dir="ltr" /></FormControl><FormMessage /></FormItem>} />
                            <FormField control={form.control} name="contact_us.content_en" render={({ field }) => <FormItem><FormLabel>Content (English)</FormLabel><FormControl><Textarea {...field} rows={3} dir="ltr" /></FormControl><FormMessage /></FormItem>} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>صفحة "الأسئلة الشائعة"</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <FormField control={form.control} name="faq.title_ar" render={({ field }) => <FormItem><FormLabel>العنوان (عربي)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                            <FormField control={form.control} name="faq.title_en" render={({ field }) => <FormItem><FormLabel>Title (English)</FormLabel><FormControl><Input {...field} dir="ltr" /></FormControl><FormMessage /></FormItem>} />
                            <Separator />
                            {fields.map((field, index) => (
                                <div key={field.id} className="space-y-3 p-4 border rounded-lg bg-muted/50">
                                    <FormField control={form.control} name={`faq.items.${index}.q_ar`} render={({ field }) => <FormItem><FormLabel>السؤال (عربي)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                                    <FormField control={form.control} name={`faq.items.${index}.a_ar`} render={({ field }) => <FormItem><FormLabel>الإجابة (عربي)</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>} />
                                    <FormField control={form.control} name={`faq.items.${index}.q_en`} render={({ field }) => <FormItem><FormLabel>Question (English)</FormLabel><FormControl><Input {...field} dir="ltr" /></FormControl><FormMessage /></FormItem>} />
                                    <FormField control={form.control} name={`faq.items.${index}.a_en`} render={({ field }) => <FormItem><FormLabel>Answer (English)</FormLabel><FormControl><Textarea {...field} dir="ltr" /></FormControl><FormMessage /></FormItem>} />
                                    <Button type="button" variant="destructive" size="sm" onClick={() => remove(index)}><Trash2 className="ml-2 h-4 w-4" /> حذف السؤال</Button>
                                </div>
                            ))}
                            <Button type="button" variant="outline" onClick={() => append({ q_ar: '', a_ar: '', q_en: '', a_en: '' })}><PlusCircle className="ml-2 h-4 w-4" /> إضافة سؤال جديد</Button>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end">
                        <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Save className="ml-2 h-4 w-4" />}
                            حفظ كل التغييرات
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
};

export default ContentManager;