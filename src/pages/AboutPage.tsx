import { useQuery } from '@tanstack/react-query';
import { fetchSiteContent } from '@/queries/content';
import { useLanguage } from '@/contexts/LanguageContext';
import { Loader2 } from 'lucide-react';

const AboutPage = () => {
    const { language, dir } = useLanguage();
    const { data: content, isLoading } = useQuery({
        queryKey: ['siteContent'],
        queryFn: fetchSiteContent,
    });

    const aboutContent = content?.about_us;
    const title = language === 'ar' ? aboutContent?.title_ar : aboutContent?.title_en;
    const text = language === 'ar' ? aboutContent?.content_ar : aboutContent?.content_en;

    return (
        <div className="container mx-auto max-w-4xl py-20 px-6" dir={dir}>
            {isLoading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <div className="relative bg-white/80 dark:bg-gray-900/70 shadow-xl rounded-2xl p-10 text-center overflow-hidden">
                    
                    {/* Decorative gradient accent */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/10 rounded-2xl -z-10"></div>

                    {/* Title */}
                    <h1 className="text-5xl font-extrabold font-kufam mb-6 text-gray-900 dark:text-gray-100">
                        {title || '...'}
                    </h1>

                    {/* Divider */}
                    <div className="w-24 h-1 bg-primary mx-auto mb-8 rounded-full"></div>

                    {/* Content */}
                    <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
                        {text || '...'}
                    </p>
                </div>
            )}
        </div>
    );
};
export default AboutPage;
