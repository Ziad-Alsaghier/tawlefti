import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { showSuccess, showError, showLoading, dismissToast } from '@/utils/toast';
import { Loader2 } from 'lucide-react';

// Schema for password validation
const passwordSchema = z.object({
  password: z.string().min(8, { message: "كلمة المرور يجب أن تكون 8 أحرف على الأقل." }),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "كلمتا المرور غير متطابقتين.",
  path: ["confirmPassword"],
});

const UpdatePasswordPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isSessionReady, setIsSessionReady] = useState(false);

  const form = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  // When the user clicks the email link, Supabase sets a temporary session.
  // We wait for this session to be ready before showing the form.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user.aud === 'authenticated') {
        setIsSessionReady(true);
      }
    });

    // Check if a session already exists on page load
    supabase.auth.getSession().then(({ data: { session } }) => {
        if (session && session.user.aud === 'authenticated') {
            setIsSessionReady(true);
        }
    });

    return () => subscription.unsubscribe();
  }, []);

  const onSubmit = async (values: z.infer<typeof passwordSchema>) => {
    setLoading(true);
    const toastId = showLoading("جاري تحديث كلمة المرور...");

    const { error } = await supabase.auth.updateUser({
      password: values.password,
    });

    dismissToast(toastId);
    setLoading(false);

    if (error) {
      showError(`فشل تحديث كلمة المرور: ${error.message}`);
    } else {
      showSuccess("تم تحديث كلمة المرور بنجاح! سيتم توجيهك لتسجيل الدخول.");
      await supabase.auth.signOut(); // Sign out the temporary session
      navigate('/login');
    }
  };

  if (!isSessionReady) {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="mr-4">جاري التحقق من الرابط...</p>
        </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4" dir="rtl">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-kufam">إعادة تعيين كلمة المرور</CardTitle>
          <CardDescription>أدخل كلمة المرور الجديدة الخاصة بك.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>كلمة المرور الجديدة</FormLabel>
                    <FormControl>
                      <Input dir="ltr" className="text-left" type="password" placeholder="********" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>تأكيد كلمة المرور الجديدة</FormLabel>
                    <FormControl>
                      <Input dir="ltr" className="text-left" type="password" placeholder="********" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                تحديث كلمة المرور
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default UpdatePasswordPage;