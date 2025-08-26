import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchBlendByCode } from '@/queries/blends';
import { Blend } from '@/types/supabase';
import BlendCard from '@/components/BlendCard';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import BlendReviews from '@/components/reviews/BlendReviews';

const BlendDetailPage = () => {
    const { blendCode } = useParams<{ blendCode: string }>();
    const navigate = useNavigate();
    const { dir, t } = useLanguage();

    const { data: blend, isLoading, error } = useQuery<Blend | null>({
        queryKey: ['blend', blendCode],
        queryFn: () => fetchBlendByCode(blendCode!),
        enabled: !!blendCode,
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex justify-center items-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !blend) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-center p-4" dir={dir}>
                <h2 className="text-3xl font-bold text-destructive mb-4">لم يتم العثور على التوليفة</h2>
                <p className="text-muted-foreground mb-8">التوليفة التي تبحث عنها غير موجودة أو غير متاحة.</p>
                <Button onClick={() => navigate('/')}>{t('return_to_home')}</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground p-4 sm:p-8" dir={dir}>
            <div className="container mx-auto max-w-4xl">
                <header className="mb-8">
                    <Button variant="ghost" onClick={() => navigate(-1)}>
                        <ArrowLeft className="ml-2 h-4 w-4" />
                        العودة
                    </Button>
                </header>
                <main>
                    <BlendCard blend={blend} matchPercentage={null} />
                    <div className="mt-8">
                        <BlendReviews blendCode={blend.code} />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default BlendDetailPage;