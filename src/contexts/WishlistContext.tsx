import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { showSuccess, showError } from '@/utils/toast';

interface WishlistItem {
    id: string;
    user_id: string;
    blend_code: string;
    created_at: string;
}

interface WishlistContextType {
    wishlist: WishlistItem[];
    isLoading: boolean;
    addToWishlist: (blendCode: string) => Promise<void>;
    removeFromWishlist: (blendCode: string) => Promise<void>;
    isInWishlist: (blendCode: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();
    const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchWishlist = useCallback(async () => {
        if (!user) {
            setWishlist([]);
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        const { data, error } = await supabase
            .from('wishlist')
            .select('*')
            .eq('user_id', user.id);
        
        if (error) {
            console.error("Error fetching wishlist:", error);
        } else {
            setWishlist(data || []);
        }
        setIsLoading(false);
    }, [user]);

    useEffect(() => {
        fetchWishlist();
    }, [fetchWishlist]);

    const addToWishlist = async (blendCode: string) => {
        if (!user) {
            showError("يجب تسجيل الدخول لإضافة توليفات إلى المفضلة.");
            return;
        }
        const { data, error } = await supabase
            .from('wishlist')
            .insert({ user_id: user.id, blend_code: blendCode })
            .select()
            .single();
        
        if (error) {
            showError("فشلت الإضافة إلى المفضلة.");
        } else {
            setWishlist(prev => [...prev, data]);
            showSuccess("تمت الإضافة إلى المفضلة!");
        }
    };

    const removeFromWishlist = async (blendCode: string) => {
        if (!user) return;
        const itemToRemove = wishlist.find(item => item.blend_code === blendCode);
        if (!itemToRemove) return;

        const { error } = await supabase
            .from('wishlist')
            .delete()
            .eq('id', itemToRemove.id);

        if (error) {
            showError("فشل الحذف من المفضلة.");
        } else {
            setWishlist(prev => prev.filter(item => item.blend_code !== blendCode));
            showSuccess("تم الحذف من المفضلة.");
        }
    };

    const isInWishlist = (blendCode: string) => {
        return wishlist.some(item => item.blend_code === blendCode);
    };

    const value = { wishlist, isLoading, addToWishlist, removeFromWishlist, isInWishlist };

    return (
        <WishlistContext.Provider value={value}>
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (context === undefined) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
};