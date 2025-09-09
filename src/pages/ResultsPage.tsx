import { useMemo } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import { getMethodById, getParentMethodId } from '@/data/coffeeData';
import { Blend } from '@/types/supabase';
import { Button } from '@/components/ui/button';
import BlendCard from '@/components/BlendCard';
import { ArrowLeft, Loader2, Info } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { fetchBlendsByMethod } from '@/queries/blends';

const ResultsPage = () => {
    const { methodId } = useParams<{ methodId: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    const { t, dir } = useLanguage();
    const { sliderValues } = location.state || { sliderValues: null };
    
    const method = getMethodById(methodId || "");

    const searchIds = useMemo(() => {
        if (!methodId) return [];
        const parentId = getParentMethodId(methodId);
        return [methodId, parentId].filter(Boolean) as string[];
    }, [methodId]);

    const { data: allRelevantBlends, isLoading, error } = useQuery<Blend[]>({
        queryKey: ['blends', searchIds],
        queryFn: () => fetchBlendsByMethod(searchIds),
        enabled: searchIds.length > 0,
    });

    const activeBlends = useMemo(() => {
        return allRelevantBlends?.filter(b => b.is_active) || [];
    }, [allRelevantBlends]);

    const recommendedBlends = useMemo(() => {
        if (activeBlends.length === 0) return [];

        if (!sliderValues || !method?.sensoryScales) {
            return activeBlends
                .map(blend => ({ ...blend, matchPercentage: null }))
                .sort((a, b) => a.name_ar.localeCompare(b.name_ar))
                .slice(0, 1); // ✅ رجع بس أول واحد
        }
        
        const calculateMatch = (blend: Blend) => {
            let totalDistance = 0;
            const scales = method.sensoryScales!;
            
            scales.forEach(scale => {
                const userValue = sliderValues[scale.id] || 3;
                const blendValue = blend.sensory_profile?.[scale.id] || 0;
                totalDistance += Math.abs(userValue - blendValue);
            });

            const maxDistance = scales.length * 4;
            if (maxDistance === 0) return { ...blend, matchPercentage: 100 };

            const matchPercentage = Math.max(0, 100 - (totalDistance / maxDistance) * 100);
            
            return { ...blend, matchPercentage };
        };

        return activeBlends
            .map(calculateMatch)
            .sort((a, b) => (b.matchPercentage ?? 0) - (a.matchPercentage ?? 0))
            .slice(0, 1); // ✅ رجع بس أعلى تطابق

    }, [sliderValues, method, activeBlends]);

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex justify-center items-center py-16">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
            );
        }

        if (error) {
            return (
                <div className="text-center py-16 text-destructive">
                    <p className="text-2xl">{t('error_fetching_blends')}</p>
                    <p className="mt-4">{(error as Error).message}</p>
                </div>
            );
        }

        // Case 1: We have active blends to show
        if (recommendedBlends.length > 0) {
            return recommendedBlends.map(blend => (
                <BlendCard key={blend.code} blend={blend} matchPercentage={blend.matchPercentage} />
            ));
        }

        // Case 2: We found blends, but they are all inactive
        if (allRelevantBlends && allRelevantBlends.length > 0 && activeBlends.length === 0) {
            return (
                <div className="text-center py-16">
                    <Alert className="max-w-md mx-auto">
                        <Info className="h-4 w-4" />
                        <AlertTitle>توجد توليفات ولكنها غير نشطة</AlertTitle>
                        <AlertDescription>
                            وجدنا توليفات لهذه الطريقة، لكنها غير مفعلة حالياً. يمكنك الذهاب إلى 
                            <Link to="/admin/blends" className="text-primary underline font-bold mx-1">لوحة التحكم</Link>
                            لتفعيلها.
                        </AlertDescription>
                    </Alert>
                </div>
            );
        }

        // Case 3: No blends found at all for this method
        if (allRelevantBlends && allRelevantBlends.length === 0) {
             return (
                <div className="text-center py-16">
                    <Alert className="max-w-md mx-auto">
                        <Info className="h-4 w-4" />
                        <AlertTitle>لا توجد توليفات بعد</AlertTitle>
                        <AlertDescription>
                            لم يتم إضافة أي توليفات لطريقة التحضير هذه حتى الآن. يمكنك أن تكون أول من يضيف واحدة من 
                            <Link to="/admin/blends" className="text-primary underline font-bold mx-1">لوحة التحكم</Link>.
                        </AlertDescription>
                    </Alert>
                </div>
            );
        }

        // Fallback (should be rare, but covers edge cases)
        return (
            <div className="text-center py-16">
                <Alert className="max-w-md mx-auto">
                    <AlertTitle>{t('no_blends_found')}</AlertTitle>
                    <AlertDescription>
                        {t('try_adjusting_scales')}
                    </AlertDescription>
                </Alert>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-background text-foreground p-4 sm:p-8" dir={dir}>
            <div className="container mx-auto">
                <header className="text-center mb-12 pt-12">
                    <h1 className="text-5xl font-bold text-primary font-kufam">
                        {t('results_title')}
                    </h1>
                    <p className="text-xl text-muted-foreground mt-4">
                        {sliderValues ? t('results_subtitle') : 'تصفح جميع التوليفات المتاحة لهذه الطريقة.'}
                    </p>
                </header>

                <main className="space-y-8">
                    {renderContent()}
                </main>

                <div className="text-center mt-12">
                    <Button variant="link" onClick={() => navigate(-1)}>
                        <ArrowLeft className="ml-2 h-4 w-4" />
                        {t('back_to_adjust_search')}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ResultsPage;
