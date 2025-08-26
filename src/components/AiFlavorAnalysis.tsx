import { Blend } from '@/types/supabase';
import { CoffeeMethod, SubMethod } from '@/data/coffeeData';
import { useLanguage } from '@/contexts/LanguageContext';

interface AiFlavorAnalysisProps {
    blend: Blend;
    method: CoffeeMethod | SubMethod | undefined;
}

const getAdjective = (score: number, lang: 'ar' | 'en'): string => {
    const adjectives: Record<string, Record<'ar' | 'en', string[]>> = {
        high: {
            ar: ['قوي', 'واضح', 'مكثف', 'غني', 'نابض بالحياة'],
            en: ['strong', 'clear', 'intense', 'rich', 'vibrant']
        },
        mid: {
            ar: ['متوازن', 'معتدل', 'سلس', 'متناغم', 'ممتع'],
            en: ['balanced', 'moderate', 'smooth', 'harmonious', 'pleasant']
        },
        low: {
            ar: ['خفيف', 'رقيق', 'ناعم', 'لطيف', 'هادئ'],
            en: ['light', 'delicate', 'soft', 'gentle', 'calm']
        },
    };
    
    const getRandomItem = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

    if (score >= 4) return getRandomItem(adjectives.high[lang]);
    if (score === 3) return getRandomItem(adjectives.mid[lang]);
    return getRandomItem(adjectives.low[lang]);
};

const AiFlavorAnalysis = ({ blend, method }: AiFlavorAnalysisProps) => {
    const { language, t, dir } = useLanguage();

    if (!method || !('sensoryScales' in method) || !blend.sensory_profile) return null;

    const sensoryScores = Object.entries(blend.sensory_profile)
        .filter(([key]) => method.sensoryScales.some(scale => scale.id === key))
        .map(([key, value]) => ({
            id: key,
            name: method.sensoryScales.find(s => s.id === key)?.name[language] || key,
            value: value as number,
        }))
        .sort((a, b) => b.value - a.value);

    if (sensoryScores.length === 0) {
        return <p>لا توجد بيانات حسية كافية لتحليل هذه التوليفة.</p>;
    }

    const highestScore = sensoryScores[0];
    const lowestScore = sensoryScores[sensoryScores.length - 1];
    
    const blendNotes = language === 'ar' ? blend.notes_ar : blend.notes_en;
    const mainNotes = blendNotes?.split(/،|,/) || [];
    const primaryNote = mainNotes[0]?.trim() || 'Flavor';
    const secondaryNote = mainNotes[1]?.trim() || 'Aroma';
    const blendName = language === 'ar' ? blend.name_ar : blend.name_en;

    const p1 = t('ai_p1', { blendName: blendName, methodName: method.name[language] });
    const p2 = t('ai_p2', { primaryNote, secondaryNote });
    const p3 = t('ai_p3', { 
        highestScoreName: highestScore.name, 
        highestScoreAdjective: getAdjective(highestScore.value, language),
        lowestScoreName: lowestScore.name,
        lowestScoreAdjective: getAdjective(lowestScore.value, language)
    });
    const p4 = t('ai_p4', { highestScoreName: highestScore.name });

    return (
        <div className="space-y-4 text-right" dir={dir}>
            <p dangerouslySetInnerHTML={{ __html: p1 }} />
            <p dangerouslySetInnerHTML={{ __html: p2 }} />
            <p dangerouslySetInnerHTML={{ __html:p3 }} />
            <p className="pt-2" dangerouslySetInnerHTML={{ __html: p4 }} />
        </div>
    );
};

export default AiFlavorAnalysis;