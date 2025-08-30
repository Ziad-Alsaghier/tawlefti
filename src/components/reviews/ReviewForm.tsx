import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import ReviewForm from '@/components/reviews/ReviewForm';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { showSuccess, showError } from '@/utils/toast';
import { Loader2, Star } from 'lucide-react';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

// Zod Schema for Validation
const reviewSchema = z.object({
    rating: z.number().min(1, 'التقييم مطلوب').max(5, 'أقصى تقييم هو 5 نجوم'),
    comment: z.string().max(500, 'التعليق يجب أن يكون أقل من 500 حرف').optional(),
});

interface ReviewFormProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    blendCode: string;
    blendName: string;
}

const ReviewForm = ({ isOpen, setIsOpen, blendCode, blendName }: ReviewFormProps) => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [hoverRating, setHoverRating] = useState(0);

    // Setup form with default values
    const form = useForm<z.infer<typeof reviewSchema>>({
        resolver: zodResolver(reviewSchema),
        defaultValues: {
            rating: 0,
            comment: '',
        },
    });

    // Submit handler
    async function onSubmit(values: z.infer<typeof reviewSchema>) {
        if (!user) {
            showError('يجب تسجيل الدخول لتقييم المنتج');
            return;
        }

        try {
            const { error } = await supabase.from('reviews').upsert(
                {
                    user_id: user.id,
                    blend_code: blendCode,
                    rating: values.rating,
                    comment: values.comment?.trim() || null,
                },
                { onConflict: 'user_id, blend_code' }
            );

            if (error) throw error;

            showSuccess('شكراً لك! تم إرسال تقييمك بنجاح.');
            queryClient.invalidateQueries({ queryKey: ['reviews', blendCode] });
            setIsOpen(false);
            form.reset();
        } catch (err: any) {
            showError(`فشل إرسال التقييم: ${err.message || 'حدث خطأ غير متوقع'}`);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent dir="rtl">
                <DialogHeader>
                    <DialogTitle>تقييم توليفتك: {blendName}</DialogTitle>
                    <DialogDescription>شاركنا رأيك لمساعدة الآخرين.</DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {/* Rating Field */}
                        <FormField
                            control={form.control}
                            name="rating"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>تقييمك</FormLabel>
                                    <FormControl>
                                        <div
                                            className="flex items-center gap-1"
                                            onMouseLeave={() => setHoverRating(0)}
                                        >
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={star}
                                                    aria-label={`${star} نجوم`}
                                                    className={`h-8 w-8 cursor-pointer transition-colors ${(hoverRating || field.value || 0) >= star
                                                            ? 'text-yellow-400 fill-yellow-400'
                                                            : 'text-muted-foreground'
                                                        }`}
                                                    onMouseEnter={() => setHoverRating(star)}
                                                    onClick={() => field.onChange(star)}
                                                />
                                            ))}
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Comment Field */}
                        <FormField
                            control={form.control}
                            name="comment"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>تعليقك (اختياري)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="صف لنا تجربتك مع هذه التوليفة..."
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Footer Actions */}
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                                إلغاء
                            </Button>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting && (
                                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                                )}
                                إرسال التقييم
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default ReviewForm;
