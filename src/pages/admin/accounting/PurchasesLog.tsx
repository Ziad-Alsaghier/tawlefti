import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Purchase } from '@/types/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Loader2 } from 'lucide-react';
import PurchaseForm from '@/components/admin/PurchaseForm';

const fetchPurchases = async (): Promise<Purchase[]> => {
    const { data, error } = await supabase.from('purchases').select('*, suppliers(name)').order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data as Purchase[];
};

const ProcurementManager = () => {
    const [showForm, setShowForm] = useState(false);
    const { data: purchases, isLoading, error } = useQuery<Purchase[]>({
        queryKey: ['purchases'],
        queryFn: fetchPurchases,
    });

    return (
        <>
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">إدارة المشتريات</h1>
                        <p className="text-muted-foreground mt-2">سجل لجميع عمليات شراء المواد الخام وتكاليفها.</p>
                    </div>
                    <Button onClick={() => setShowForm(true)}>
                        <PlusCircle className="ml-2 h-4 w-4" />
                        تسجيل عملية شراء
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>سجل المشتريات</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading && <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>}
                        {error && <p className="text-destructive text-center p-8">{(error as Error).message}</p>}
                        {purchases && (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>التاريخ</TableHead>
                                        <TableHead>النوع</TableHead>
                                        <TableHead>الكود</TableHead>
                                        <TableHead>الكمية</TableHead>
                                        <TableHead>التكلفة</TableHead>
                                        <TableHead>المورد</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {purchases.map(p => (
                                        <TableRow key={p.id}>
                                            <TableCell>{new Date(p.created_at).toLocaleDateString('ar-EG')}</TableCell>
                                            <TableCell>{p.item_type === 'coffee' ? 'بن' : 'تحويجة'}</TableCell>
                                            <TableCell className="font-mono text-xs">{p.item_code}</TableCell>
                                            <TableCell>{p.quantity} {p.item_type === 'coffee' ? 'كجم' : 'جم'}</TableCell>
                                            <TableCell className="font-medium">{p.cost} جنيه</TableCell>
                                            <TableCell>{p.suppliers?.name || p.supplier || '-'}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
            <PurchaseForm isOpen={showForm} setIsOpen={setShowForm} />
        </>
    );
};

export default ProcurementManager;