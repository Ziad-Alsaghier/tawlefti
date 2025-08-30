import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import ReviewForm from '@/components/reviews/ReviewForm';

interface Review {
    id: string;
    user_id: string;       // Make sure you have user_id in reviews table
    rating: number;
    comment: string | null;
    created_at: string;
    full_name?: string;    // Added manually after merge
}

const fetchReviewsWithProfiles = async (blendCode: string) => {
    // 1️⃣ Fetch all reviews
    const { data: reviews, error: reviewsError } = await supabase
        .from('reviews')
        .select('*')
        .eq('blend_code', blendCode)
        .order('created_at', { ascending: false });

    if (reviewsError) throw reviewsError;

    if (!reviews || reviews.length === 0) return [];

    // 2️⃣ Get unique user IDs from reviews
    const userIds = reviews.map(r => r.user_id);

    // 3️⃣ Fetch profiles for those users
    const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);

    if (profilesError) throw profilesError;

    // 4️⃣ Merge profiles with reviews manually
    return reviews.map(review => {
        const profile = profiles.find(p => p.id === review.user_id);
        return {
            ...review,
            full_name: profile?.full_name || 'مستخدم',
        };
    });
};

const getInitials = (name: string | null | undefined) => {
    if (!name) return '؟';
    const names = name.trim().split(' ');
    if (names.length > 1)
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
};

const BlendReviews = ({
    blendCode,
    blendName,
}: {
    blendCode: string;
    blendName: string;
}) => {
    const [isFormOpen, setIsFormOpen] = useState(false);

    const {
        data: reviews,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['reviews', blendCode],
        queryFn: () => fetchReviewsWithProfiles(blendCode),
    });

    const averageRating =
        reviews && reviews.length > 0
            ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
            : 0;

    return (
        <>
            <Card>
                <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                        <CardTitle>تقييمات العملاء</CardTitle>
                        {reviews && reviews.length > 0 && (
                            <div className="flex items-center gap-2 pt-2">
                                <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`h-5 w-5 ${i < Math.round(averageRating)
                                                ? 'text-yellow-400 fill-yellow-400'
                                                : 'text-muted-foreground'
                                                }`}
                                        />
                                    ))}
                                </div>
                                <span className="text-muted-foreground text-sm">
                                    {averageRating.toFixed(1)} من 5 ({reviews.length} تقييم)
                                </span>
                            </div>
                        )}
                    </div>

                    <Button onClick={() => setIsFormOpen(true)} className="mt-4 md:mt-0">
                        أضف تقييمك
                    </Button>
                </CardHeader>

                <CardContent>
                    {isLoading && (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    )}
                    {error && (
                        <p className="text-destructive text-center p-8">
                            {(error as Error).message}
                        </p>
                    )}
                    {reviews && reviews.length > 0 ? (
                        <div className="space-y-6">
                            {reviews.map((review) => (
                                <div key={review.id} className="flex items-start gap-4">
                                    <Avatar>
                                        <AvatarFallback>
                                            {getInitials(review.full_name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <p className="font-semibold">
                                                {review.full_name}
                                            </p>
                                            <div className="flex items-center">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`h-4 w-4 ${i < review.rating
                                                            ? 'text-yellow-400 fill-yellow-400'
                                                            : 'text-muted-foreground'
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        {review.comment && (
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {review.comment}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        !isLoading && (
                            <p className="text-muted-foreground text-center py-10">
                                لا توجد تقييمات لهذه التوليفة بعد. كن أول من يكتب تقييمًا!
                            </p>
                        )
                    )}
                </CardContent>
            </Card>

            {/* Review Form Modal */}
            <ReviewForm
                isOpen={isFormOpen}
                setIsOpen={setIsFormOpen}
                blendCode={blendCode}
                blendName={blendName}
            />
        </>
    );
};

export default BlendReviews;
