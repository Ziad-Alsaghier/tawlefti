import { useState, useMemo } from 'react';
import { Blend, Additive, CoffeeType } from '@/types/supabase';
import { getMethodById } from '@/data/coffeeData';
import { blendSpecificNotes, defaultMethodNotes, methodToDefaultNoteMap } from '@/data/preparationNotes';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ClipboardList, ShoppingCart, Loader2, Heart } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import AiFlavorAnalysis from './AiFlavorAnalysis';
import { useLanguage } from '@/contexts/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { useCart } from '@/contexts/CartContext';
import { fetchActiveAdditives } from '@/queries/additives';
import { fetchBlendComposition } from '@/queries/blends';
import { fetchCoffeePrices } from '@/queries/coffee';
import { calculateBlendPrice } from '@/lib/pricing';
import { fetchMethodStatuses } from '@/queries/admin';
import { supabase } from '@/integrations/supabase/client';
import { useWishlist } from '@/contexts/WishlistContext';
import { cn } from '@/lib/utils';

interface BlendCardProps {
    blend: Blend;
    matchPercentage: number | null;
}

type RoastLevel = 'light' | 'medium' | 'dark';

const fetchStoreSettings = async () => {
    const { data, error } = await supabase.from('store_settings').select('key, value');
    if (error) throw error;
    const settings: Record<string, any> = {};
    data.forEach(item => {
        settings[item.key] = item.value;
    });
    return settings;
};

const BlendCard = ({ blend, matchPercentage }: BlendCardProps) => {
    const [roast, setRoast] = useState<RoastLevel>('medium');
    const [weight, setWeight] = useState('250');
    const [selectedAdditives, setSelectedAdditives] = useState<string[]>([]);
    const { language, t } = useLanguage();
    const { addToCart } = useCart();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const isFavorite = isInWishlist(blend.code);
    
    const method = getMethodById(blend.method_id);
    const isGreenCoffee = blend.method_id ? ['cold-infusion', 'boiling', 'hot-infusion'].includes(blend.method_id) : false;

    const { data: additives, isLoading: isLoadingAdditives } = useQuery<Additive[]>({ queryKey: ['additives'], queryFn: fetchActiveAdditives });
    
    const { data: fetchedComposition, isLoading: isLoadingCompositionInternal } = useQuery<any[]>({ 
        queryKey: ['composition', blend.code], 
        queryFn: () => fetchBlendComposition(blend.code),
        enabled: !blend.blend_compositions
    });

    const composition = useMemo(() => blend.blend_compositions || fetchedComposition, [blend.blend_compositions, fetchedComposition]);
    const isLoadingComposition = !blend.blend_compositions && isLoadingCompositionInternal;

    const { data: coffeePrices, isLoading: isLoadingPrices } = useQuery<Record<string, any>>({ 
        queryKey: ['prices', composition?.map(c => c.coffee_type_code)], 
        queryFn: () => fetchCoffeePrices(composition!), 
        enabled: !!composition && composition.length > 0 
    });

    const { data: methodStatuses } = useQuery({
        queryKey: ['methodStatuses'],
        queryFn: fetchMethodStatuses,
    });

    const { data: storeSettings, isLoading: isLoadingSettings } = useQuery({
        queryKey: ['storeSettings'],
        queryFn: fetchStoreSettings,
    });

    const methodProfitMargin = useMemo(() => {
        if (!methodStatuses || !blend.method_id) return 1.4; // Default profit margin
        const status = methodStatuses.find(s => s.method_id === blend.method_id);
        return status?.profit_margin ?? 1.4;
    }, [methodStatuses, blend.method_id]);

    const { finalPrice: price } = useMemo(() => calculateBlendPrice({
        blend,
        composition,
        coffeePrices,
        additives,
        roast,
        weight,
        selectedAdditiveIds: selectedAdditives,
        methodProfitMargin,
        fixedCosts: storeSettings?.fixed_costs,
    }), [blend, composition, coffeePrices, additives, roast, weight, selectedAdditives, methodProfitMargin, storeSettings]);

    const coffeeOrigins = useMemo(() => {
        if (!composition || composition.length === 0) return null;
        return composition
            .map(c => language === 'ar' ? c.coffee_types?.name_ar : (c.coffee_types?.name_en || c.coffee_types?.name_ar))
            .filter(Boolean)
            .join(' - ');
    }, [composition, language]);

    const handleAdditiveChange = (additiveId: string) => {
        setSelectedAdditives(prev => prev.includes(additiveId) ? prev.filter(item => item !== additiveId) : [...prev, additiveId]);
    };

    const handleAddToCart = () => {
        const selectedAdditivesObjects = additives?.filter(a => selectedAdditives.includes(a.id)).map(a => ({ id: a.id, name_ar: a.name_ar, price_per_250g: a.price_per_250g })) || [];
        
        const itemToAdd = {
            blend_code: blend.code,
            blend_name_ar: blend.name_ar,
            roast,
            weight,
            selectedAdditives: selectedAdditivesObjects,
            quantity: 1,
            price,
        };
        addToCart(itemToAdd);
    };

    const handleFavoriteToggle = () => {
        if (isFavorite) {
            removeFromWishlist(blend.code);
        } else {
            addToWishlist(blend.code);
        }
    };
    
    const blendName = language === 'ar' ? blend.name_ar : blend.name_en;
    const flavorNotes = language === 'ar' ? blend.notes_ar : blend.notes_en;
    
    const preparationNotesText = useMemo(() => {
        const dbNote = language === 'ar' ? blend.preparation_notes_ar : blend.preparation_notes_en;
        if (dbNote && dbNote.trim() !== '') return dbNote;
        const fileNote = blendSpecificNotes[blend.code];
        if (fileNote) return fileNote[language];
        const methodId = blend.method_id;
        if (!methodId) return null;
        const defaultNoteCode = methodToDefaultNoteMap[methodId];
        if (!defaultNoteCode) return null;
        const defaultNoteData = defaultMethodNotes[defaultNoteCode];
        if (!defaultNoteData) return null;
        return defaultNoteData[language];
    }, [blend, language]);

    const availableAdditives = useMemo(() => {
        if (!additives || blend.display_category === 'وظيفية') {
            return [];
        }
        return additives;
    }, [additives, blend.display_category]);

    return (
        <Card className="bg-card shadow-lg border-border/50 overflow-hidden">
            <CardHeader className="p-6">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-3xl font-kufam text-primary">{blendName}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">{t('blend_code')}: {blend.code}</p>
                    </div>
                    {matchPercentage !== null && <Badge variant="default" className="text-lg bg-primary/20 text-primary border-primary/30">{t('match')} {Math.round(matchPercentage)}%</Badge>}
                </div>
                <div className="pt-4 space-y-2">
                    {isLoadingComposition ? <p><strong className="font-semibold">{isGreenCoffee ? t('green_composition') : t('composition')}:</strong> ...</p> : coffeeOrigins ? <p><strong className="font-semibold">{isGreenCoffee ? t('green_composition') : t('composition')}:</strong> {coffeeOrigins}</p> : null}
                    {flavorNotes && <p><strong className="font-semibold">{t('flavor_notes')}:</strong> {flavorNotes}</p>}
                    {preparationNotesText && <p><strong className="font-semibold">{t('preparation_notes')}:</strong> {preparationNotesText}</p>}
                </div>
            </CardHeader>
            
            <Separator />

            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h4 className="text-xl font-semibold mb-4">{t('flavor_fingerprint')}</h4>
                    <div className="space-y-4">
                        {method?.sensoryScales?.map(scale => (
                            <div key={scale.id}>
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm font-medium">{scale.name[language]}</span>
                                    <span className="text-sm text-muted-foreground">{blend.sensory_profile?.[scale.id] || 0}/5</span>
                                </div>
                                <Progress value={((blend.sensory_profile?.[scale.id] || 0) / 5) * 100} className="h-2" />
                            </div>
                        ))}
                    </div>
                    <Dialog>
                        <DialogTrigger asChild><Button variant="outline" className="w-full mt-6"><ClipboardList className="ml-2 h-4 w-4" />{t('ai_flavor_analysis')}</Button></DialogTrigger>
                        <DialogContent className="sm:max-w-[625px]" dir={language === 'ar' ? 'rtl' : 'ltr'}><DialogHeader><DialogTitle className="text-2xl font-kufam text-center">{t('ai_analysis_title', { blendName: blendName })}</DialogTitle><DialogDescription className="text-center">{t('ai_analysis_desc')}</DialogDescription></DialogHeader><AiFlavorAnalysis blend={blend} method={method} /></DialogContent>
                    </Dialog>
                </div>

                <div className="bg-accent/50 p-6 rounded-lg">
                    <h4 className="text-xl font-semibold mb-4">{t('customize_touch')}</h4>
                    <div className="space-y-6">
                        <div>
                            <Label className="text-base font-medium mb-2 block">{t('roast_level')}</Label>
                            <div className="flex gap-2">
                                <Button variant={roast === 'light' ? 'default' : 'outline'} onClick={() => setRoast('light')} className="flex-1">{t('light')}</Button>
                                <Button variant={roast === 'medium' ? 'default' : 'outline'} onClick={() => setRoast('medium')} className="flex-1">{t('medium')}</Button>
                                <Button variant={roast === 'dark' ? 'default' : 'outline'} onClick={() => setRoast('dark')} className="flex-1">{t('dark')}</Button>
                            </div>
                        </div>
                        <div>
                            <Label className="text-base font-medium mb-2 block">{t('weight')}</Label>
                             <div className="flex gap-2">
                                <Button variant={weight === '250' ? 'default' : 'outline'} onClick={() => setWeight('250')} className="flex-1">250g</Button>
                                <Button variant={weight === '500' ? 'default' : 'outline'} onClick={() => setWeight('500')} className="flex-1">500g</Button>
                                <Button variant={weight === '1000' ? 'default' : 'outline'} onClick={() => setWeight('1000')} className="flex-1">1000g</Button>
                            </div>
                        </div>
                        {availableAdditives.length > 0 && (
                            <div>
                                <Label className="text-base font-medium mb-2 block">{t('additives')}</Label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
                                    {isLoadingAdditives ? <Loader2 className="animate-spin" /> : availableAdditives.map((additive) => (
                                        <div key={additive.id} className="flex items-center space-x-2 space-x-reverse">
                                            <Checkbox id={`${blend.code}-${additive.id}`} checked={selectedAdditives.includes(additive.id)} onCheckedChange={() => handleAdditiveChange(additive.id)} />
                                            <label htmlFor={`${blend.code}-${additive.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{language === 'ar' ? additive.name_ar : additive.name_en}</label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>

            <Separator />

            <CardFooter className="p-6 bg-card flex justify-between items-center">
                <div>
                    <p className="text-sm text-muted-foreground">{t('price')}</p>
                    <p className="text-3xl font-bold text-primary">{isLoadingComposition || isLoadingPrices || isLoadingSettings ? <Loader2 className="animate-spin" /> : `${price} ${t('egp')}`}</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="ghost" size="icon" onClick={handleFavoriteToggle}>
                        <Heart className={cn("h-6 w-6", isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground")} />
                    </Button>
                    <Button size="lg" onClick={handleAddToCart} disabled={isLoadingComposition || isLoadingPrices || isLoadingSettings}><ShoppingCart className="ml-2 h-5 w-5" />{t('add_to_cart')}</Button>
                </div>
            </CardFooter>
        </Card>
    );
};

export default BlendCard;