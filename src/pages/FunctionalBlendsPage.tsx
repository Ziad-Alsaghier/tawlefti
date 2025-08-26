import { useQuery } from '@tanstack/react-query';
import { Blend } from '@/types/supabase';
import { fetchFunctionalBlends } from '@/queries/blends';
import { Loader2, ArrowLeft, Coffee, BrainCircuit, Zap, Wind, Dumbbell, Sun, Users, Flame, Skull, Lightbulb, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const getFunctionalIcon = (name: string) => {
    if (name.includes('شغف') || name.toLowerCase().includes('passion')) {
        return (
            <div className="h-12 w-12 flex items-center justify-center font-bold text-3xl text-primary">
                <span className="font-mono">+18</span>
            </div>
        );
    }
    if (name.includes('إشراقة') || name.toLowerCase().includes('ishraqa')) return <Sun className="h-12 w-12 text-primary" />;
    if (name.includes('ديوان') || name.toLowerCase().includes('diwan')) return <Users className="h-12 w-12 text-primary" />;
    if (name.includes('تركيز') || name.toLowerCase().includes('tarkeez')) return <BrainCircuit className="h-12 w-12 text-primary" />;
    if (name.includes('باور') || name.toLowerCase().includes('power')) return <Zap className="h-12 w-12 text-primary" />;
    if (name.includes('هدوء') || name.toLowerCase().includes('hodoo')) return <Wind className="h-12 w-12 text-primary" />;
    if (name.includes('تمرين') || name.toLowerCase().includes('tamreen')) return <Dumbbell className="h-12 w-12 text-primary" />;
    if (name.includes('دفء') || name.toLowerCase().includes('def')) return <Flame className="h-12 w-12 text-primary" />;
    if (name.includes('بركان') || name.toLowerCase().includes('borkan')) return <Skull className="h-12 w-12 text-primary" />;
    if (name.includes('إلهام') || name.toLowerCase().includes('elham')) return <Lightbulb className="h-12 w-12 text-primary" />;
    if (name.includes('هضم') || name.toLowerCase().includes('hadm')) return <Leaf className="h-12 w-12 text-primary" />;
    return <Coffee className="h-12 w-12 text-primary" />;
};

const blendDescriptionKeyMap: Record<string, string> = {
    'إشراقة': 'blend_desc_ishraqa',
    'ديوان': 'blend_desc_diwan',
    'تركيز': 'blend_desc_tarkeez',
    'باور': 'blend_desc_power',
    'هدوء': 'blend_desc_hodoo',
    'تمرين': 'blend_desc_tamreen',
    'دفء': 'blend_desc_def',
    'بركان': 'blend_desc_borkan',
    'إلهام': 'blend_desc_elham',
    'هضم': 'blend_desc_hadm',
    'شغف': 'blend_desc_shaghaf',
};

const FunctionalBlendsPage = () => {
    const navigate = useNavigate();
    const { language, dir, t } = useLanguage();

    const { data: blends, isLoading, error } = useQuery<Blend[]>({
        queryKey: ['functionalBlends'],
        queryFn: fetchFunctionalBlends,
    });

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
                    <p className="text-2xl">{(error as Error).message}</p>
                </div>
            );
        }

        if (!blends || blends.length === 0) {
            return (
                <Alert className="max-w-md mx-auto">
                    <Coffee className="h-4 w-4" />
                    <AlertTitle>{t('no_functional_blends_title')}</AlertTitle>
                    <AlertDescription>{t('no_functional_blends_desc')}</AlertDescription>
                </Alert>
            );
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {blends.map(blend => {
                    const blendName = language === 'ar' ? blend.name_ar : (blend.name_en || blend.name_ar);
                    const descriptionKey = blendDescriptionKeyMap[blend.name_ar];
                    const description = descriptionKey ? t(descriptionKey) : (language === 'ar' ? blend.notes_ar : blend.notes_en);

                    return (
                        <Card key={blend.code} className="text-center flex flex-col justify-between p-6 shadow-lg hover:shadow-primary/20 transition-all duration-300 transform hover:-translate-y-1 border-transparent hover:border-primary/30">
                            <CardHeader className="p-0">
                                <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                                    {getFunctionalIcon(blend.name_ar)}
                                </div>
                                <CardTitle className="text-2xl font-kufam">{blendName}</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0 mt-4 flex-grow">
                                <p className="text-muted-foreground">
                                    {description || 'وصف قصير لهذه التوليفة الرائعة.'}
                                </p>
                            </CardContent>
                            <CardFooter className="p-0 mt-6">
                                <Button className="w-full" onClick={() => navigate(`/blend/${blend.code}`)}>
                                    {t('explore_blend')}
                                    {language === 'ar' ? <ArrowLeft className="mr-2 h-4 w-4" /> : <ArrowLeft className="ml-2 h-4 w-4" />}
                                </Button>
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-background text-foreground p-4 sm:p-8" dir={dir}>
            <div className="container mx-auto max-w-5xl">
                <header className="text-center mb-12 pt-12">
                    <h1 className="text-5xl font-bold text-primary font-kufam flex items-center justify-center gap-3">
                        <Coffee className="h-10 w-10" />
                        {t('functional_blends_page_title')}
                    </h1>
                    <p className="text-xl text-muted-foreground mt-4 max-w-2xl mx-auto">
                        {t('functional_blends_page_subtitle')}
                    </p>
                </header>

                <main>
                    {renderContent()}
                </main>

                <div className="text-center mt-12">
                    <Button variant="link" onClick={() => navigate('/')}>
                        {language === 'ar' ? <ArrowLeft className="ml-2 h-4 w-4" /> : null}
                        {t('return_to_home')}
                        {language === 'en' ? <ArrowLeft className="ml-2 h-4 w-4" /> : null}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default FunctionalBlendsPage;