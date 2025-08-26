import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { Additive, DiscountCode, CustomerLoyalty } from '@/types/supabase';
import { v4 as uuidv4 } from 'uuid';
import { showSuccess, showError } from '@/utils/toast';

export interface CartItem {
    id: string;
    blend_code: string;
    blend_name_ar: string;
    roast: 'light' | 'medium' | 'dark';
    weight: string;
    selectedAdditives: Pick<Additive, 'id' | 'name_ar' | 'price_per_250g'>[];
    quantity: number;
    price: number;
}

interface CartContextType {
    cartItems: CartItem[];
    addToCart: (item: Omit<CartItem, 'id'>) => Promise<void>;
    removeFromCart: (itemId: string) => Promise<void>;
    updateQuantity: (itemId: string, newQuantity: number) => Promise<void>;
    clearCart: () => Promise<void>;
    isLoading: boolean;
    itemCount: number;
    subtotal: number;
    loyaltyDiscount: number;
    pointsToRedeem: number;
    promoDiscount: number;
    appliedPromoCode: DiscountCode | null;
    total: number;
    customerPoints: number;
    isFetchingPoints: boolean;
    redeemPoints: boolean;
    setRedeemPoints: (redeem: boolean) => void;
    fetchLoyaltyPoints: (phone: string) => Promise<void>;
    applyPromoCode: (code: string) => Promise<boolean>;
    removePromoCode: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loyaltyDiscount, setLoyaltyDiscount] = useState(0);
    const [pointsToRedeem, setPointsToRedeem] = useState(0);
    const [promoDiscount, setPromoDiscount] = useState(0);
    const [appliedPromoCode, setAppliedPromoCode] = useState<DiscountCode | null>(null);
    const [customerPoints, setCustomerPoints] = useState(0);
    const [isFetchingPoints, setIsFetchingPoints] = useState(false);
    const [redeemPoints, setRedeemPoints] = useState(false);
    const [session, setSession] = useState<Session | null>(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    const subtotal = useMemo(() => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0), [cartItems]);

    const mapDbCartToLocal = (dbCart: any): CartItem => ({
        id: dbCart.id,
        blend_code: dbCart.blend_code,
        blend_name_ar: dbCart.blend_name_ar,
        roast: dbCart.roast,
        weight: String(dbCart.weight),
        selectedAdditives: dbCart.additives || [],
        quantity: dbCart.quantity,
        price: dbCart.unit_price,
    });

    const findMatchingItem = (items: CartItem[], newItem: Omit<CartItem, 'id' | 'quantity'>) => {
        return items.find(item =>
            item.blend_code === newItem.blend_code &&
            item.roast === newItem.roast &&
            item.weight === newItem.weight &&
            JSON.stringify(item.selectedAdditives.map(a => a.id).sort()) === JSON.stringify(newItem.selectedAdditives.map(a => a.id).sort())
        );
    };

    const syncDbCart = useCallback(async (userId: string) => {
        const { data, error } = await supabase.from('carts').select('*').eq('user_id', userId);
        if (error) {
            console.error("Error fetching cart from DB:", error);
            return [];
        }
        return data.map(mapDbCartToLocal);
    }, []);

    useEffect(() => {
        const initializeCart = async () => {
            setIsLoading(true);
            if (session) {
                let guestCart: CartItem[] = JSON.parse(localStorage.getItem('guestCart') || '[]');
                if (guestCart.length > 0) {
                    await Promise.all(guestCart.map(item => 
                        supabase.from('carts').insert({
                            user_id: session.user.id,
                            blend_code: item.blend_code,
                            blend_name_ar: item.blend_name_ar,
                            roast: item.roast,
                            weight: parseInt(item.weight),
                            additives: item.selectedAdditives,
                            quantity: item.quantity,
                            unit_price: item.price,
                        })
                    ));
                    localStorage.removeItem('guestCart');
                }
                const finalCart = await syncDbCart(session.user.id);
                setCartItems(finalCart);
            } else {
                const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
                setCartItems(guestCart);
            }
            setIsLoading(false);
        };
        initializeCart();
    }, [session, syncDbCart]);

    const removePromoCode = useCallback(() => {
        setPromoDiscount(0);
        setAppliedPromoCode(null);
    }, []);

    const applyPromoCode = async (code: string): Promise<boolean> => {
        if (!code) {
            showError("الرجاء إدخال كود الخصم.");
            return false;
        }
        if (redeemPoints) {
            showError("لا يمكن استخدام كود خصم مع خصم نقاط الولاء. يرجى إلغاء خصم النقاط أولاً.");
            return false;
        }

        const { data, error } = await supabase.from('discount_codes').select('*').eq('code', code.toUpperCase()).single();
        if (error || !data) {
            showError("كود الخصم غير صالح أو غير موجود.");
            return false;
        }
        if (!data.is_active) {
            showError("هذا الكود غير نشط حاليًا.");
            return false;
        }
        if (data.expires_at && new Date(data.expires_at) < new Date()) {
            showError("هذا الكود منتهي الصلاحية.");
            return false;
        }
        if (data.usage_limit !== null && data.usage_count >= data.usage_limit) {
            showError("تم الوصول للحد الأقصى لاستخدام هذا الكود.");
            return false;
        }

        let discountAmount = 0;
        if (data.type === 'fixed') {
            discountAmount = data.value;
        } else if (data.type === 'percentage') {
            discountAmount = subtotal * (data.value / 100);
        }
        if (discountAmount > subtotal) {
            discountAmount = subtotal;
        }

        setPromoDiscount(discountAmount);
        setAppliedPromoCode(data);
        showSuccess(`تم تطبيق خصم بقيمة ${discountAmount.toFixed(0)} جنيه!`);
        return true;
    };

    const fetchLoyaltyPoints = useCallback(async (phone: string) => {
        if (!phone || !/^01[0125][0-9]{8}$/.test(phone)) {
            setCustomerPoints(0);
            setIsFetchingPoints(false);
            return;
        }
        setIsFetchingPoints(true);
        try {
            const { data, error } = await supabase.from('customer_loyalty').select('*').eq('phone_number', phone).single();
            if (error && error.code !== 'PGRST116') {
                console.error("Error fetching loyalty points:", error);
                setCustomerPoints(0);
            } else {
                setCustomerPoints(data?.points || 0);
            }
        } catch (e) {
            console.error("Exception fetching loyalty points:", e);
            setCustomerPoints(0);
        } finally {
            setIsFetchingPoints(false);
        }
    }, []);

    useEffect(() => {
        if (redeemPoints && customerPoints > 0) {
            if (appliedPromoCode) {
                showError("لا يمكن استخدام نقاط الولاء مع كود خصم. يرجى إزالة كود الخصم أولاً.");
                setRedeemPoints(false);
                return;
            }
            const potentialDiscount = Math.floor(customerPoints / 10);
            const actualDiscount = Math.min(potentialDiscount, subtotal);
            const pointsUsed = actualDiscount * 10;
            setLoyaltyDiscount(actualDiscount);
            setPointsToRedeem(pointsUsed);
        } else {
            setLoyaltyDiscount(0);
            setPointsToRedeem(0);
        }
    }, [redeemPoints, customerPoints, subtotal, appliedPromoCode]);

    const addToCart = async (newItemData: Omit<CartItem, 'id'>) => {
        const existingItem = findMatchingItem(cartItems, newItemData);
        if (existingItem) {
            await updateQuantity(existingItem.id, existingItem.quantity + newItemData.quantity);
        } else {
            const newItem: CartItem = { ...newItemData, id: uuidv4() };
            if (session) {
                const { data, error } = await supabase.from('carts').insert({
                    user_id: session.user.id,
                    blend_code: newItem.blend_code,
                    blend_name_ar: newItem.blend_name_ar,
                    roast: newItem.roast,
                    weight: parseInt(newItem.weight),
                    additives: newItem.selectedAdditives,
                    quantity: newItem.quantity,
                    unit_price: newItem.price,
                }).select().single();
                if (error) { console.error(error); return; }
                setCartItems(prev => [...prev, mapDbCartToLocal(data)]);
            } else {
                const newCart = [...cartItems, newItem];
                setCartItems(newCart);
                localStorage.setItem('guestCart', JSON.stringify(newCart));
            }
        }
        showSuccess(`${newItemData.blend_name_ar} تمت إضافته إلى السلة!`);
    };

    const updateQuantity = async (itemId: string, newQuantity: number) => {
        if (newQuantity <= 0) {
            await removeFromCart(itemId);
            return;
        }
        if (session) {
            const { error } = await supabase.from('carts').update({ quantity: newQuantity }).eq('id', itemId);
            if (error) { console.error(error); return; }
        }
        const updatedCart = cartItems.map(item => item.id === itemId ? { ...item, quantity: newQuantity } : item);
        setCartItems(updatedCart);
        if (!session) {
            localStorage.setItem('guestCart', JSON.stringify(updatedCart));
        }
    };

    const removeFromCart = async (itemId: string) => {
        if (session) {
            const { error } = await supabase.from('carts').delete().eq('id', itemId);
            if (error) { console.error(error); return; }
        }
        const updatedCart = cartItems.filter(item => item.id !== itemId);
        setCartItems(updatedCart);
        if (!session) {
            localStorage.setItem('guestCart', JSON.stringify(updatedCart));
        }
    };

    const clearCart = async () => {
        if (session) {
            const { error } = await supabase.from('carts').delete().eq('user_id', session.user.id);
            if (error) { console.error(error); return; }
        }
        setCartItems([]);
        if (!session) {
            localStorage.removeItem('guestCart');
        }
        setLoyaltyDiscount(0);
        setPointsToRedeem(0);
        setPromoDiscount(0);
        setAppliedPromoCode(null);
        setRedeemPoints(false);
    };

    const total = subtotal - loyaltyDiscount - promoDiscount;

    const value = { 
        cartItems, 
        addToCart, 
        removeFromCart, 
        updateQuantity, 
        clearCart, 
        isLoading, 
        itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
        subtotal,
        loyaltyDiscount,
        pointsToRedeem,
        promoDiscount,
        appliedPromoCode,
        total,
        customerPoints,
        isFetchingPoints,
        redeemPoints,
        setRedeemPoints,
        fetchLoyaltyPoints,
        applyPromoCode,
        removePromoCode,
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};