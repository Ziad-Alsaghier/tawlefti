import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface Review {
    id: string;
    rating: number;
    comment: string | null;
    created_at: string;
    profiles: { full_name: string | null } | null;
}

const fetchReviews = async (blendCode: string): Promise<Review[]> => {
    const { data, error } = await supabase
        .from('reviews')
        .select('*, profiles(full_name)')
        .eq('blend_code', blendCode)
        .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data as Review[];
};

const getInitials = (name: string | null | undefined) => {
    if (!name) return '؟';
    const names = name.trim().split(' ');
    if (names.length > 1) return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
};

const BlendReviews = ({ blendCode }: { blendCode: string }) => {
    const { data: reviews, isLoading, error } = useQuery({
        queryKey: ['reviews', blendCode],
        queryFn: () => fetchReviews(blendCode),
    });

    const averageRating = reviews && reviews.length > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
        : 0;

    return (
        <Card>
            <CardHeader>
                <CardTitle>تقييمات العملاء</CardTitle>
                {reviews && reviews.length > 0 && (
                    <div className="flex items-center gap-2 pt-2">
                        <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`h-5 w-5 ${i < Math.round(averageRating) ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`} />
                            ))}
                        </div>
                        <span className="text-muted-foreground text-sm">
                            {averageRating.toFixed(1)} من 5 ({reviews.length} تقييم)
                        </span>
                    </div>
                )}
            </CardHeader>
            <CardContent>
                {isLoading && <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>}
                {error && <p className="text-destructive text-center p-8">{(error as Error).message}</p>}
                {reviews && reviews.length > 0 ? (
                    <div className="space-y-6">
                        {reviews.map(review => (
                            <div key={review.id} className="flex items-start gap-4">
                                <Avatar>
                                    <AvatarFallback>{getInitials(review.profiles?.full_name)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <p className="font-semibold">{review.profiles?.full_name || 'مستخدم'}</p>
                                        <div className="flex items-center">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`} />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">{review.comment}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    !isLoading && <p className="text-muted-foreground text-center py-10">لا توجد تقييمات لهذه التوليفة بعد. كن أول من يكتب تقييمًا!</p>
                )}
            </CardContent>
        </Card>
    );
};

export default BlendReviews;