import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { showError, showSuccess } from '@/utils/toast';

const SignUpPage = () => {
    const navigate = useNavigate();
    const { dir } = useLanguage();
    const { session } = useAuth();

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        phone_number: '',
        address: '',
        email: '',
        password: '',
    });

    useEffect(() => {
        if (session) {
            navigate('/');
        }
    }, [session, navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { email, password, full_name, phone_number, address } = formData;

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name,
                    phone_number,
                    address,
                },
                emailRedirectTo: `${window.location.origin}/`,
            },
        });

        setLoading(false);

        if (error) {
            showError(`فشل التسجيل: ${error.message}`);
        } else {
            showSuccess('تم إنشاء الحساب! يرجى التحقق من بريدك الإلكتروني.');
        }
    };

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

                <form onSubmit={handleSubmit} className="bg-card p-8 rounded-lg shadow-lg border border-border/50 space-y-4">
                    <input
                        type="text"
                        name="full_name"
                        placeholder="الاسم بالكامل"
                        value={formData.full_name}
                        onChange={handleChange}
                        required
                        className="w-full p-2 rounded border border-border bg-background"
                    />
                    <input
                        type="number"
                        name="phone_number"
                        placeholder="رقم الهاتف"
                        value={formData.phone_number}
                        onChange={handleChange}
                        required
                        className="w-full p-2 rounded border border-border bg-background"
                    />
                    <input
                        type="text"
                        name="address"
                        placeholder="العنوان بالتفصيل"
                        value={formData.address}
                        onChange={handleChange}
                        required
                        className="w-full p-2 rounded border border-border bg-background"
                    />
                    <input
                        type="email"
                        name="email"
                        placeholder="البريد الإلكتروني"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full p-2 rounded border border-border bg-background"
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="كلمة المرور"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className="w-full p-2 rounded border border-border bg-background"
                    />

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'جاري التسجيل...' : 'إنشاء حساب'}
                    </Button>

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
                </form>

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
