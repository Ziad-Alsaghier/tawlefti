import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { coffeeMethods } from "@/data/coffeeData";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Loader2, Coffee } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { MethodStatus } from '@/types/supabase';
import { fetchMethodStatuses } from '@/queries/admin';

const Index = () => {
  const { language, t, dir } = useLanguage();

  const { data: methodStatuses, isLoading } = useQuery<MethodStatus[]>({
      queryKey: ['methodStatuses'],
      queryFn: fetchMethodStatuses,
  });

  const activeMethods = useMemo(() => {
      if (!methodStatuses) return coffeeMethods.filter(m => !m.subMethods);

      const statusMap = new Map(methodStatuses.map(s => [s.method_id, s.is_active]));
      
      return coffeeMethods.filter(method => {
          const isActive = statusMap.get(method.id) ?? true;
          if (!isActive) return false;

          if (method.subMethods) {
              return method.subMethods.some(sm => statusMap.get(sm.id) ?? true);
          }
          return true;
      });
  }, [methodStatuses]);

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-8" dir={dir}>
      <div className="container mx-auto">
        <header className="text-center mb-12 pt-12">
          <h1 className="text-5xl font-bold text-primary font-kufam">
            {t('main_title')}
            <sup className="ml-1">
              <span className="text-xs font-bold border border-primary rounded-full w-6 h-6 inline-flex items-center justify-center text-primary">
                TM
              </span>
            </sup>
          </h1>
          <p className="text-xl text-muted-foreground mt-4">
            {t('main_subtitle')}
          </p>
        </header>

        <main>
          <section className="mb-16">
            <Link to="/functional-blends" className="w-full max-w-5xl mx-auto flex justify-between items-center p-6 bg-card rounded-lg shadow-lg border border-border/50 hover:bg-accent transition-colors">
                <div className="flex items-center gap-3">
                    <Coffee className="h-8 w-8 text-primary" />
                    <h2 className="text-3xl font-semibold font-kufam text-primary">
                        {t('functional_blends_link_title')}
                    </h2>
                </div>
            </Link>
          </section>

          <h2 className="text-3xl font-semibold text-center mb-8">
            {t('main_choose_method')}
          </h2>
          {isLoading ? (
              <div className="flex justify-center items-center py-16">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <Link to={`/method/${method.id}`} key={method.id} className="focus:outline-none focus:ring-2 focus:ring-primary rounded-lg">
                    <Card 
                      className="bg-card hover:bg-accent transition-all duration-300 cursor-pointer shadow-lg hover:shadow-primary/20 border-transparent hover:border-primary/30 border transform hover:-translate-y-1 flex flex-col items-center p-6 text-center h-full"
                    >
                      <div className="p-4 bg-primary/10 rounded-full mb-4">
                        <Icon className="w-10 h-10 text-primary" />
                      </div>
                      <CardHeader className="p-0">
                        <CardTitle className="text-2xl font-kufam">{method.name[language]}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-0 mt-2">
                        <p className="text-muted-foreground">{method.description[language]}</p>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </main>
        
        <footer className="mt-16">
          {/* Made with Dyad component removed */}
        </footer>
      </div>
    </div>
  );
};

export default Index;