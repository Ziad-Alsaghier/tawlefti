import { useCart, CartItem } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Plus, Minus, Trash2, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { Badge } from './ui/badge';

const CartSheet = () => {
  const { 
    cartItems, 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    isLoading, 
    itemCount,
    subtotal,
    loyaltyDiscount,
    total
  } = useCart();
  const { t, dir } = useLanguage();
  const navigate = useNavigate();

  const handleCheckout = () => {
    navigate('/checkout');
  };

  const CartItemCard = ({ item }: { item: CartItem }) => (
    <div className="flex items-start justify-between gap-4 py-4">
      <div className="flex-1">
        <h4 className="font-semibold">{item.blend_name_ar}</h4>
        <p className="text-sm text-muted-foreground">
          {t(item.roast)} / {item.weight}g
        </p>
        {item.selectedAdditives.length > 0 && (
          <p className="text-xs text-muted-foreground">
            + {item.selectedAdditives.map(a => a.name_ar).join(', ')}
          </p>
        )}
        <p className="font-semibold mt-2">{item.price.toFixed(0)} {t('egp')}</p>
      </div>
      <div className="flex flex-col items-end gap-2">
        <div className="flex items-center gap-2">
          <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-6 text-center">{item.quantity}</span>
          <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => removeFromCart(item.id)}>
          <Trash2 className="h-4 w-4 ml-1" />
          {t('remove')}
        </Button>
      </div>
    </div>
  );

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="fixed bottom-4 right-4 h-14 w-14 rounded-full shadow-lg z-50">
          <ShoppingCart className="h-6 w-6" />
          {itemCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-6 w-6 flex items-center justify-center rounded-full bg-primary text-primary-foreground">
              {itemCount}
            </Badge>
          )}
          <span className="sr-only">Open Cart</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col" dir={dir}>
        <SheetHeader>
          <SheetTitle className="text-2xl">{t('cart_title')}</SheetTitle>
        </SheetHeader>
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : cartItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="font-semibold">{t('cart_empty')}</p>
            <p className="text-sm text-muted-foreground">{t('cart_empty_desc')}</p>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="divide-y">
                {cartItems.map(item => <CartItemCard key={item.id} item={item} />)}
              </div>
            </ScrollArea>
            <Separator className="my-4" />
            <SheetFooter className="space-y-4">
              <div className="flex justify-between items-center text-lg">
                <span>{t('subtotal')}</span>
                <span>{subtotal.toFixed(0)} {t('egp')}</span>
              </div>
              {loyaltyDiscount > 0 && (
                <div className="flex justify-between items-center text-lg text-destructive">
                  <span>{t('loyalty_discount')}</span>
                  <span>- {loyaltyDiscount.toFixed(0)} {t('egp')}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between items-center text-xl font-bold">
                <span>{t('total')}</span>
                <span>{total.toFixed(0)} {t('egp')}</span>
              </div>
              <SheetClose asChild>
                <Button size="lg" className="w-full" onClick={handleCheckout}>{t('proceed_to_checkout')}</Button>
              </SheetClose>
              <Button variant="outline" className="w-full" onClick={clearCart}>{t('clear_cart')}</Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartSheet;