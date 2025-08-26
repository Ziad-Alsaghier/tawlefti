import { useWishlist } from '@/contexts/WishlistContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Blend } from '@/types/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import BlendCard from '@/components/BlendCard';

const fetchBlendsByCodes = async (codes: string[]): Promise<Blend[]> => {
    if (codes.length === 0) return [];
    const { data, error } = await supabase
        .from('blends')
        .select('*, blend_compositions(*, coffee_types(name_ar, name_en))')
        .in('code', codes);
    if (error) throw new Error(error.message);
    return data;
};

const WishlistTab = () => {
    const { wishlist, isLoading: isWishlistLoading } = useWishlist();
    const blendCodes = wishlist.map(item => item.blend_code);

    const { data: blends, isLoading: areBlendsLoading, error } = useQuery({
        queryKey: ['wishlistBlends', blendCodes],
        queryFn: () => fetchBlendsByCodes(blendCodes),
        enabled: blendCodes.length > 0,
    });

    const isLoading = isWishlistLoading || areBlendsLoading;

    return (
        <Card>
            <CardHeader>
                <CardTitle>قائمتي المفضلة</CardTitle>
                <CardDescription>التوليفات التي قمت بحفظها للعودة إليها لاحقًا.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading && <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>}
                {error && <p className="text-destructive text-center p-8">{(error as Error).message}</p>}
                {!isLoading && blends && blends.length > 0 ? (
                    <div className="space-y-8">
                        {blends.map(blend => (
                            <BlendCard key={blend.code} blend={blend} matchPercentage={null} />
                        ))}
                    </div>
                ) : (
                    !isLoading && <p className="text-muted-foreground text-center py-10">قائمة المفضلة فارغة. أضف بعض التوليفات!</p>
                )}
            </CardContent>
        </Card>
    );
};

export default WishlistTab;