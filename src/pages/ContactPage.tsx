import { useQuery } from '@tanstack/react-query';
import { fetchSiteContent } from '@/queries/content';
import { useLanguage } from '@/contexts/LanguageContext';
import { Loader2 } from 'lucide-react';

const ContactPage = () => {
    const { language, dir } = useLanguage();
    const { data: content, isLoading } = useQuery({
        queryKey: ['siteContent'],
        queryFn: fetchSiteContent,
    });

    const contactContent = content?.contact_us;
    const title = language === 'ar' ? contactContent?.title_ar : contactContent?.title_en;
    const text = language === 'ar' ? contactContent?.content_ar : contactContent?.content_en;

    return (
        <div className="container mx-auto max-w-3xl py-16 px-4 text-center" dir={dir}>
            {isLoading ? (
                <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin" /></div>
            ) : (
                <>
                    <h1 className="text-4xl font-bold font-kufam mb-4">{title || '...'}</h1>
                    <p className="text-lg text-muted-foreground">
                        {text || '...'}
                    </p>
                </>
            )}
        </div>
    );
};
export default ContactPage;