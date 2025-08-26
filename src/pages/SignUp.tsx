import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Auth } from '@supabase/auth-ui-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { Button } from '@/components/ui/button';
import { showError } from '@/utils/toast';

const SignUpPage = () => {
    const navigate = useNavigate();
    const { dir } = useLanguage();
    const { session } = useAuth();

    useEffect(() => {
        if (session) {
            navigate('/');
        }
    }, [session, navigate]);

    const handleGoogleSignIn = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/`,
            },
        });
        if (error) {
            showError(`فشل التسجيل: ${error.message}`);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4" dir={dir}>
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-kufam font-bold text-primary">
                        إنشاء حساب جديد
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        انضم إلى تَولِيفتِي™ وابدأ رحلتك مع القهوة.
                    </p>
                </div>
                <div className="bg-card p-8 rounded-lg shadow-lg border border-border/50">
                    <div dir="ltr">
                        <Auth
                            supabaseClient={supabase}
                            appearance={{
                                theme: ThemeSupa,
                                variables: {
                                    default: {
                                        colors: {
                                            brand: 'hsl(var(--primary))',
                                            brandAccent: 'hsl(24 70% 35%)',
                                            brandButtonText: 'hsl(var(--primary-foreground))',
                                            defaultButtonBackground: 'hsl(var(--card))',
                                            defaultButtonBackgroundHover: 'hsl(var(--accent))',
                                            defaultButtonBorder: 'hsl(var(--border))',
                                            defaultButtonText: 'hsl(var(--foreground))',
                                            dividerBackground: 'hsl(var(--border))',
                                            inputBackground: 'hsl(var(--background))',
                                            inputBorder: 'hsl(var(--border))',
                                            inputBorderHover: 'hsl(var(--border))',
                                            inputBorderFocus: 'hsl(var(--ring))',
                                            inputText: 'hsl(var(--foreground))',
                                            inputLabelText: 'hsl(var(--foreground))',
                                            inputPlaceholder: 'hsl(var(--muted-foreground))',
                                            anchorTextColor: 'hsl(var(--muted-foreground))',
                                            anchorTextColorHover: 'hsl(var(--primary))',
                                            messageText: 'hsl(var(--foreground))',
                                            messageTextDanger: 'hsl(var(--destructive))',
                                        },
                                        radii: {
                                            borderRadiusButton: 'var(--radius)',
                                            inputBorderRadius: 'var(--radius)',
                                        },
                                    },
                                },
                                className: {
                                    container: '', // Remove default container styling
                                    label: 'text-sm font-medium',
                                    button: 'font-bold',
                                    anchor: 'text-sm'
                                }
                            }}
                            providers={[]}
                            view="sign_up"
                            showLinks={false}
                            signUpFields={[
                                {
                                    id: 'full_name',
                                    label: 'الاسم بالكامل',
                                    placeholder: 'أدخل اسمك الكامل',
                                },
                                {
                                    id: 'phone_number',
                                    label: 'رقم الهاتف',
                                    placeholder: '01xxxxxxxxx',
                                    type: 'tel',
                                },
                                {
                                    id: 'address',
                                    label: 'العنوان بالتفصيل',
                                    placeholder: 'أدخل عنوانك التفصيلي',
                                },
                            ]}
                            localization={{
                                variables: {
                                    sign_up: {
                                        email_label: 'البريد الإلكتروني',
                                        password_label: 'كلمة المرور',
                                        email_input_placeholder: 'your@email.com',
                                        password_input_placeholder: 'كلمة المرور الخاصة بك',
                                        button_label: 'إنشاء حساب',
                                        social_provider_text: 'التسجيل بواسطة {{provider}}',
                                        link_text: 'ليس لديك حساب؟ أنشئ حسابًا',
                                    },
                                },
                            }}
                        />
                    </div>
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-card px-2 text-muted-foreground">
                                أو أكمل بواسطة
                            </span>
                        </div>
                    </div>
                    <Button variant="outline" className="w-full" onClick={handleGoogleSignIn}>
                        التسجيل بواسطة <span className="font-bold text-primary mr-1">Google</span>
                    </Button>
                </div>
                <div className="mt-4 text-center text-sm" dir={dir}>
                    لديك حساب بالفعل؟{' '}
                    <Link to="/login" className="underline text-primary">
                        سجل الدخول
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default SignUpPage;