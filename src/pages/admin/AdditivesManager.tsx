import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Additive } from '@/types/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, MoreHorizontal, Trash2, Edit, Loader2 } from 'lucide-react';
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
import AdditiveForm from '@/components/admin/AdditiveForm';
import { Badge } from '@/components/ui/badge';

const fetchAdditives = async (): Promise<Additive[]> => {
    const { data, error } = await supabase.from('additives').select('*').order('name_ar');
    if (error) throw new Error(error.message);
    return data;
};

const AdditivesManager = () => {
    const queryClient = useQueryClient();
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [selectedAdditive, setSelectedAdditive] = useState<Additive | null>(null);
    const [additiveToDelete, setAdditiveToDelete] = useState<Additive | null>(null);

    const { data: additives, isLoading, error } = useQuery<Additive[]>({
        queryKey: ['additives'],
        queryFn: fetchAdditives,
    });

    const handleAddNew = () => {
        setSelectedAdditive(null);
        setShowForm(true);
    };

    const handleEdit = (additive: Additive) => {
        setSelectedAdditive(additive);
        setShowForm(true);
    };

    const handleDelete = (additive: Additive) => {
        setAdditiveToDelete(additive);
        setShowDeleteDialog(true);
    };

    const confirmDelete = async () => {
        if (!additiveToDelete) return;
        const { error } = await supabase.from('additives').delete().eq('id', additiveToDelete.id);
        if (error) {
            showError(`فشل حذف التحويجة: ${error.message}`);
        } else {
            showSuccess('تم حذف التحويجة بنجاح.');
            queryClient.invalidateQueries({ queryKey: ['additives'] });
        }
        setShowDeleteDialog(false);
        setAdditiveToDelete(null);
    };

    return (
        <>
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold">إدارة التحويجات</h1>
                <Button onClick={handleAddNew}>
                    <PlusCircle className="ml-2 h-4 w-4" />
                    إضافة تحويجة جديدة
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>قائمة التحويجات</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading && <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>}
                    {error && <p className="text-destructive text-center p-8">{(error as Error).message}</p>}
                    {additives && (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>الاسم (عربي)</TableHead>
                                    <TableHead>سعر البيع / 250جم</TableHead>
                                    <TableHead>التكلفة / 250جم</TableHead>
                                    <TableHead>الحالة</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {additives.map(additive => (
                                    <TableRow key={additive.id}>
                                        <TableCell className="font-medium">{additive.name_ar}</TableCell>
                                        <TableCell>{additive.price_per_250g} جنيه</TableCell>
                                        <TableCell>{additive.cost_per_250g} جنيه</TableCell>
                                        <TableCell>
                                            <Badge variant={additive.is_active ? 'default' : 'outline'}>
                                                {additive.is_active ? 'نشط' : 'غير نشط'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-left">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleEdit(additive)}>
                                                        <Edit className="ml-2 h-4 w-4" />
                                                        <span>تعديل</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDelete(additive)} className="text-destructive focus:text-destructive">
                                                        <Trash2 className="ml-2 h-4 w-4" />
                                                        <span>حذف</span>
                                                    </DropdownMenuItem>
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

            <AdditiveForm
                isOpen={showForm}
                setIsOpen={setShowForm}
                additive={selectedAdditive}
            />

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent dir="rtl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
                        <AlertDialogDescription>
                            هل تريد بالتأكيد حذف "{additiveToDelete?.name_ar}"؟
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
                            حذف
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};

export default AdditivesManager;