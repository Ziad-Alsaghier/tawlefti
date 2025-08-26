import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DiscountCode } from '@/types/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, MoreHorizontal, Trash2, Edit, Loader2, Tag } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { showSuccess, showError } from '@/utils/toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import DiscountForm from '@/components/admin/DiscountForm';
import { Badge } from '@/components/ui/badge';

const fetchDiscounts = async (): Promise<DiscountCode[]> => {
    const { data, error } = await supabase.from('discount_codes').select('*').order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data;
};

const DiscountsManager = () => {
    const queryClient = useQueryClient();
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [selectedDiscount, setSelectedDiscount] = useState<DiscountCode | null>(null);
    const [discountToDelete, setDiscountToDelete] = useState<DiscountCode | null>(null);

    const { data: discounts, isLoading, error } = useQuery<DiscountCode[]>({
        queryKey: ['discounts'],
        queryFn: fetchDiscounts,
    });

    const handleAddNew = () => {
        setSelectedDiscount(null);
        setShowForm(true);
    };

    const handleEdit = (discount: DiscountCode) => {
        setSelectedDiscount(discount);
        setShowForm(true);
    };

    const handleDelete = (discount: DiscountCode) => {
        setDiscountToDelete(discount);
        setShowDeleteDialog(true);
    };

    const confirmDelete = async () => {
        if (!discountToDelete) return;
        const { error } = await supabase.from('discount_codes').delete().eq('id', discountToDelete.id);
        if (error) {
            showError(`فشل حذف الكود: ${error.message}`);
        } else {
            showSuccess('تم حذف الكود بنجاح.');
            queryClient.invalidateQueries({ queryKey: ['discounts'] });
        }
        setShowDeleteDialog(false);
        setDiscountToDelete(null);
    };

    return (
        <>
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold">إدارة أكواد الخصم</h1>
                <Button onClick={handleAddNew}>
                    <PlusCircle className="ml-2 h-4 w-4" />
                    إضافة كود جديد
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>قائمة الأكواد</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading && <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>}
                    {error && <p className="text-destructive text-center p-8">{(error as Error).message}</p>}
                    {discounts && (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>الكود</TableHead>
                                    <TableHead>القيمة</TableHead>
                                    <TableHead>الاستخدام</TableHead>
                                    <TableHead>تاريخ الانتهاء</TableHead>
                                    <TableHead>الحالة</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {discounts.map(d => (
                                    <TableRow key={d.id}>
                                        <TableCell className="font-mono font-bold"><Tag className="inline-block ml-2 h-4 w-4 text-muted-foreground"/>{d.code}</TableCell>
                                        <TableCell>{d.value} {d.type === 'percentage' ? '%' : 'جنيه'}</TableCell>
                                        <TableCell>{d.usage_count} / {d.usage_limit || '∞'}</TableCell>
                                        <TableCell>{d.expires_at ? new Date(d.expires_at).toLocaleDateString('ar-EG') : 'لا يوجد'}</TableCell>
                                        <TableCell>
                                            <Badge variant={d.is_active ? 'default' : 'outline'}>
                                                {d.is_active ? 'نشط' : 'غير نشط'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-left">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleEdit(d)}><Edit className="ml-2 h-4 w-4" /><span>تعديل</span></DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDelete(d)} className="text-destructive focus:text-destructive"><Trash2 className="ml-2 h-4 w-4" /><span>حذف</span></DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <DiscountForm isOpen={showForm} setIsOpen={setShowForm} discount={selectedDiscount} />

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent dir="rtl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
                        <AlertDialogDescription>هل تريد بالتأكيد حذف الكود "{discountToDelete?.code}"؟</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">حذف</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};

export default DiscountsManager;