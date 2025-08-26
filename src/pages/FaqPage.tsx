import { useQuery } from '@tanstack/react-query';
import { fetchSiteContent } from '@/queries/content';
import { useLanguage } from '@/contexts/LanguageContext';
import { Loader2 } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FaqPage = () => {
    const { language, dir } = useLanguage();
    const { data: content, isLoading } = useQuery({
        queryKey: ['siteContent'],
        queryFn: fetchSiteContent,
    });

    const faqContent = content?.faq;
    const title = language === 'ar' ? faqContent?.title_ar : faqContent?.title_en;
    const items = faqContent?.items || [];

    return (
        <div className="container mx-auto max-w-3xl py-16 px-4" dir={dir}>
            {isLoading ? (
                <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin" /></div>
            ) : (
                <>
                    <h1 className="text-4xl font-bold font-kufam mb-8 text-center">{title || '...'}</h1>
                    <Accordion type="single" collapsible className="w-full">
                        {items.map((item: any, index: number) => (
                            <AccordionItem value={`item-${index}`} key={index}>
                                <AccordionTrigger>{language === 'ar' ? item.q_ar : item.q_en}</AccordionTrigger>
                                <AccordionContent>
                                    {language === 'ar' ? item.a_ar : item.a_en}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </>
            )}
        </div>
    );
};
export default FaqPage;