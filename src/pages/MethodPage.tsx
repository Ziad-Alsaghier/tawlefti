import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getMethodById, SubMethod, coffeeMethods } from "@/data/coffeeData";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Search, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from '@tanstack/react-query';
import { MethodStatus } from '@/types/supabase';
import { fetchMethodStatuses } from '@/queries/admin';

const MethodPage = () => {
  const { methodId } = useParams<{ methodId: string }>();
  const navigate = useNavigate();
  const { language, t, dir } = useLanguage();
  const methodData = getMethodById(methodId || "");

  const { data: methodStatuses, isLoading: isLoadingStatuses } = useQuery<MethodStatus[]>({
      queryKey: ['methodStatuses'],
      queryFn: fetchMethodStatuses,
  });

  const [sliderValues, setSliderValues] = useState<Record<string, number>>({});

  useEffect(() => {
    if (methodData && 'sensoryScales' in methodData && methodData.sensoryScales) {
      const initialValues: Record<string, number> = {};
      methodData.sensoryScales.forEach(scale => {
        initialValues[scale.id] = 3; // Default value
      });
      setSliderValues(initialValues);
    } else {
      setSliderValues({}); // Clear values if there are no scales
    }
  }, [methodId, methodData]);

  const activeSubMethods = useMemo(() => {
      if (!methodData || !('subMethods' in methodData) || !methodData.subMethods) return [];
      if (!methodStatuses) return methodData.subMethods;

      const statusMap = new Map(methodStatuses.map(s => [s.method_id, s.is_active]));
      return methodData.subMethods.filter(sm => statusMap.get(sm.id) ?? true);
  }, [methodData, methodStatuses]);

  if (!methodData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-4" dir={dir}>
        <h2 className="text-3xl font-bold text-destructive mb-4">{t('method_not_found')}</h2>
        <p className="text-muted-foreground mb-8">{t('method_not_found_desc')}</p>
        <Button asChild>
          <Link to="/">{t('return_to_home')}</Link>
        </Button>
      </div>
    );
  }

  // Case 1: This is a category page with sub-methods
  if ('subMethods' in methodData && methodData.subMethods) {
    const Icon = methodData.icon;
    return (
      <div className="min-h-screen bg-background text-foreground p-4 sm:p-8" dir={dir}>
        <div className="container mx-auto">
          <header className="text-center mb-12 pt-12">
            <div className="flex items-center justify-center gap-4 mb-4">
                <div className="p-3 bg-primary/10 rounded-full">
                    <Icon className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-5xl font-bold text-primary font-kufam">
                    {methodData.name[language]}
                </h1>
            </div>
            <p className="text-xl text-muted-foreground mt-4 max-w-2xl mx-auto">
              {methodData.description[language]}
            </p>
            <h2 className="text-3xl font-semibold text-center mt-8 mb-8">
              {t('choose_your_tool')}
            </h2>
          </header>
          <main>
            {isLoadingStatuses ? (
                <div className="flex justify-center items-center py-16">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
                {activeSubMethods.map((subMethod: SubMethod) => {
                  const SubIcon = subMethod.icon;
                  return (
                    <Link to={`/method/${subMethod.id}`} key={subMethod.id} className="focus:outline-none focus:ring-2 focus:ring-primary rounded-lg">
                      <Card className="bg-card hover:bg-accent transition-all duration-300 cursor-pointer shadow-lg hover:shadow-primary/20 border-transparent hover:border-primary/30 border transform hover:-translate-y-1 flex flex-col items-center p-6 text-center h-full">
                        <div className="p-4 bg-primary/10 rounded-full mb-4">
                          <SubIcon className="w-10 h-10 text-primary" />
                        </div>
                        <CardHeader className="p-0">
                          <CardTitle className="text-2xl font-kufam">{subMethod.name[language]}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 mt-2">
                          <p className="text-muted-foreground">{subMethod.description[language]}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            )}
          </main>
          <div className="text-center mt-12">
            <Button variant="link" onClick={() => navigate('/')}>
                <ArrowLeft className="ml-2 h-4 w-4" />
                {t('back_to_choose_another_category')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Case 2: This is a final method page with sliders
  if ('sensoryScales' in methodData && methodData.sensoryScales) {
    const handleSliderChange = (scaleId: string, value: number[]) => {
      setSliderValues(prev => ({ ...prev, [scaleId]: value[0] }));
    };

    const handleSearch = () => {
      navigate(`/results/${methodId}`, { state: { sliderValues } });
    };

    const Icon = methodData.icon;

    return (
      <div className="min-h-screen bg-background text-foreground p-4 sm:p-8" dir={dir}>
        <div className="container mx-auto">
          <header className="text-center mb-12 pt-12">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Icon className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-5xl font-bold text-primary font-kufam">
                {methodData.name[language]}
              </h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {methodData.description[language]}
            </p>
            <p className="text-lg text-foreground mt-6">
              {t('adjust_sliders')}
            </p>
          </header>

          <main className="max-w-3xl mx-auto">
            <Card className="bg-card shadow-lg border-border/50">
              <CardHeader>
                <CardTitle className="text-2xl text-center">{t('sensory_scales')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8 pt-4">
                {methodData.sensoryScales.map((scale) => (
                  <div key={scale.id}>
                    <label htmlFor={scale.id} className="text-lg font-medium text-center block mb-2">
                      {scale.name[language]}
                    </label>
                    <div className="grid grid-cols-[auto,1fr,auto] items-center gap-4">
                      <span className="text-sm text-muted-foreground w-16 text-left">
                        {dir === 'rtl' ? scale.highLabel[language] : scale.lowLabel[language]}
                      </span>
                      <Slider
                        id={scale.id}
                        min={1}
                        max={5}
                        step={1}
                        value={[sliderValues[scale.id]]}
                        onValueChange={(value) => handleSliderChange(scale.id, value)}
                        className="flex-grow"
                      />
                      <span className="text-sm text-muted-foreground w-16 text-right">
                        {dir === 'rtl' ? scale.lowLabel[language] : scale.highLabel[language]}
                      </span>
                    </div>
                     <div className="text-center mt-2">
                        <span className="text-lg font-bold text-primary w-4 text-center">
                            {sliderValues[scale.id]}
                        </span>
                     </div>
                     <p className="text-center text-sm text-muted-foreground mt-2 h-10 flex items-center justify-center">
                        {scale.levelDescriptions[language][sliderValues[scale.id] - 1]}
                     </p>
                  </div>
                ))}
                <div className="pt-6 flex justify-center">
                  <Button size="lg" className="text-xl px-10 py-6 font-bold" onClick={handleSearch}>
                    <Search className="ml-3 h-6 w-6" />
                    {t('search_for_my_blend')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </main>

          <div className="text-center mt-12">
            <Button variant="link" onClick={() => navigate(-1)}>
              <ArrowLeft className="ml-2 h-4 w-4" />
              {t('back_to_choose_another_method')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Fallback, should not be reached
  return <div>حدث خطأ غير متوقع.</div>;
};

export default MethodPage;