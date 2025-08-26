import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CoffeeType, Additive } from '@/types/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, AlertTriangle, Package, Leaf } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const fetchCoffeeInventory = async (): Promise<CoffeeType[]> => {
    const { data, error } = await supabase.from('coffee_types').select('*').order('name_ar');
    if (error) throw new Error(error.message);
    return data;
};

const fetchAdditiveInventory = async (): Promise<Additive[]> => {
    const { data, error } = await supabase.from('additives').select('id, name_ar, stock_grams').order('name_ar');
    if (error) throw new Error(error.message);
    return data;
};

const InventoryManager = () => {
    const { data: coffeeInventory, isLoading: isLoadingCoffee } = useQuery<CoffeeType[]>({
        queryKey: ['inventoryCoffee'],
        queryFn: fetchCoffeeInventory,
    });

    const { data: additiveInventory, isLoading: isLoadingAdditives } = useQuery<Additive[]>({
        queryKey: ['inventoryAdditives'],
        queryFn: fetchAdditiveInventory,
    });

    const isLoading = isLoadingCoffee || isLoadingAdditives;

    const StockBadge = ({ stock, unit, threshold }: { stock: number | null, unit: string, threshold: number }) => {
        const currentStock = stock ?? 0;
        return (
            <Badge variant={currentStock < threshold ? 'destructive' : 'secondary'}>
                {currentStock.toFixed(2)} {unit}
                {currentStock < threshold && <AlertTriangle className="inline-block mr-1 h-4 w-4" />}
            </Badge>
        );
    };

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold">إدارة المخزون</h1>
                <p className="text-muted-foreground mt-2">نظرة حية على كميات المواد الخام والمحمصة المتوفرة لديك.</p>
            </div>

            {isLoading && <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Leaf className="text-green-600"/> مخزون البن الأخضر</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader><TableRow><TableHead>النوع</TableHead><TableHead>الكمية المتاحة</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {coffeeInventory?.map(item => (
                                    <TableRow key={item.code}>
                                        <TableCell className="font-medium">{item.name_ar}</TableCell>
                                        <TableCell><StockBadge stock={item.stock_green_kg} unit="كجم" threshold={5} /></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Package className="text-yellow-600"/> مخزون التحويجات</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader><TableRow><TableHead>النوع</TableHead><TableHead>الكمية المتاحة</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {additiveInventory?.map(item => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.name_ar}</TableCell>
                                        <TableCell><StockBadge stock={item.stock_grams} unit="جرام" threshold={100} /></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
            
            <Card className="col-span-1 lg:col-span-2">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><img src="/logo.svg" alt="Roaster" className="h-6 w-6" /> مخزون البن المحمص</CardTitle>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>النوع</TableHead>
                                <TableHead>تحميص فاتح</TableHead>
                                <TableHead>تحميص وسط</TableHead>
                                <TableHead>تحميص غامق</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {coffeeInventory?.map(item => (
                                <TableRow key={item.code}>
                                    <TableCell className="font-medium">{item.name_ar}</TableCell>
                                    <TableCell><StockBadge stock={item.stock_light_kg} unit="كجم" threshold={1} /></TableCell>
                                    <TableCell><StockBadge stock={item.stock_medium_kg} unit="كجم" threshold={1} /></TableCell>
                                    <TableCell><StockBadge stock={item.stock_dark_kg} unit="كجم" threshold={1} /></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default InventoryManager;