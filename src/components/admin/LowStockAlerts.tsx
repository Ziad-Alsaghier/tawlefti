import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '../ui/button';

const fetchInventoryForAlerts = async () => {
    const coffeePromise = supabase.from('coffee_types').select('name_ar, stock_green_kg');
    const additivesPromise = supabase.from('additives').select('name_ar, stock_grams');
    const [{ data: coffee, error: coffeeError }, { data: additives, error: additivesError }] = await Promise.all([coffeePromise, additivesPromise]);
    if (coffeeError) throw coffeeError;
    if (additivesError) throw additivesError;
    return { coffee, additives };
};

const LowStockAlerts = () => {
    const { data, isLoading } = useQuery({
        queryKey: ['inventoryForAlerts'],
        queryFn: fetchInventoryForAlerts,
    });

    const lowStockCoffee = data?.coffee?.filter(c => c.stock_green_kg !== null && c.stock_green_kg < 5) || [];
    const lowStockAdditives = data?.additives?.filter(a => a.stock_grams !== null && a.stock_grams < 100) || [];

    if (isLoading) {
        return (
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>جاري فحص المخزون...</span>
                    </CardTitle>
                </CardHeader>
            </Card>
        );
    }

    if (lowStockCoffee.length === 0 && lowStockAdditives.length === 0) {
        return null;
    }

    return (
        <Card className="mb-8 border-destructive bg-destructive/10">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-6 w-6" />
                    <span>تنبيه: انخفاض المخزون!</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="mb-4">بعض المواد الخام على وشك النفاد وتحتاج إلى إعادة طلب:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <h4 className="font-semibold mb-2">بن أخضر (أقل من 5 كجم):</h4>
                        {lowStockCoffee.length > 0 ? (
                            <ul className="list-disc list-inside space-y-1">
                                {lowStockCoffee.map(c => <li key={c.name_ar}>{c.name_ar}: <span className="font-bold">{c.stock_green_kg?.toFixed(2)} كجم</span></li>)}
                            </ul>
                        ) : <p className="text-sm text-muted-foreground">لا يوجد نقص.</p>}
                    </div>
                    <div>
                        <h4 className="font-semibold mb-2">تحويجات (أقل من 100 جرام):</h4>
                        {lowStockAdditives.length > 0 ? (
                            <ul className="list-disc list-inside space-y-1">
                                {lowStockAdditives.map(a => <li key={a.name_ar}>{a.name_ar}: <span className="font-bold">{a.stock_grams?.toFixed(2)} جم</span></li>)}
                            </ul>
                        ) : <p className="text-sm text-muted-foreground">لا يوجد نقص.</p>}
                    </div>
                </div>
                <div className="mt-6 flex justify-end">
                    <Button asChild variant="secondary">
                        <Link to="/admin/inventory">الذهاب إلى صفحة المخزون</Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default LowStockAlerts;