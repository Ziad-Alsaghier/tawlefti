import { useAuth } from '@/contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { showSuccess, showError } from '@/utils/toast';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';

const profileSchema = z.object({
  full_name: z.string().min(2, { message: "الاسم يجب أن يكون حرفين على الأقل." }),
  phone_number: z.string().regex(/^01[0125][0-9]{8}$/, { message: "الرجاء إدخال رقم هاتف مصري صحيح." }),
  address: z.string().min(10, { message: "العنوان يجب أن يكون 10 أحرف على الأقل." }),
});

const EditProfileForm = () => {
    const { user, profile, loading } = useAuth();
    const queryClient = useQueryClient();

    const form = useForm<z.infer<typeof profileSchema>>({
        resolver: zodResolver(profileSchema),
    });

    useEffect(() => {
        if (profile) {
            form.reset({
                full_name: profile.full_name || '',
                phone_number: profile.phone_number || '',
                address: profile.address || '',
            });
        }
    }, [profile, form]);

    const onSubmit = async (values: z.infer<typeof profileSchema>) => {
        if (!user) return;

        const { error } = await supabase
            .from('profiles')
            .update({
                full_name: values.full_name,
                phone_number: values.phone_number,
                address: values.address,
            })
            .eq('id', user.id);

        if (error) {
            showError(`فشل تحديث الملف الشخصي: ${error.message}`);
        } else {
            showSuccess('تم تحديث ملفك الشخصي بنجاح.');
            queryClient.invalidateQueries({ queryKey: ['profiles', user.id] });
        }
    };

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>معلوماتي الشخصية</CardTitle>
                <CardDescription>قم بتحديث بياناتك هنا.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField control={form.control} name="full_name" render={({ field }) => (<FormItem><FormLabel>الاسم بالكامل</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="phone_number" render={({ field }) => (<FormItem><FormLabel>رقم الهاتف</FormLabel><FormControl><Input dir="ltr" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="address" render={({ field }) => (<FormItem><FormLabel>العنوان</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <Button type="submit" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                            حفظ التغييرات
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
};

export default EditProfileForm;