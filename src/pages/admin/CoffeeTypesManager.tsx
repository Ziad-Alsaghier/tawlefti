import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CoffeeType } from '@/types/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import CoffeeTypeForm from '@/components/admin/CoffeeTypeForm';
import { Badge } from '@/components/ui/badge';

const fetchCoffeeTypes = async (): Promise<CoffeeType[]> => {
    const { data, error } = await supabase.from('coffee_types').select('*').order('name_ar');
    if (error) throw new Error(error.message);
    return data;
};

const CoffeeTypesManager = () => {
    const queryClient = useQueryClient();
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [selectedCoffeeType, setSelectedCoffeeType] = useState<CoffeeType | null>(null);
    const [coffeeTypeToDelete, setCoffeeTypeToDelete] = useState<CoffeeType | null>(null);

    const { data: coffeeTypes, isLoading, error } = useQuery<CoffeeType[]>({
        queryKey: ['coffeeTypes'],
        queryFn: fetchCoffeeTypes,
    });

    const handleAddNew = () => {
        setSelectedCoffeeType(null);
        setShowForm(true);
    };

    const handleEdit = (coffeeType: CoffeeType) => {
        setSelectedCoffeeType(coffeeType);
        setShowForm(true);
    };

    const handleDelete = (coffeeType: CoffeeType) => {
        setCoffeeTypeToDelete(coffeeType);
        setShowDeleteDialog(true);
    };

    const confirmDelete = async () => {
        if (!coffeeTypeToDelete) return;

        try {
            // Check for usage in blend_compositions
            const { count: compositionsCount, error: compositionsError } = await supabase
                .from('blend_compositions')
                .select('*', { count: 'exact', head: true })
                .eq('coffee_type_code', coffeeTypeToDelete.code);

            if (compositionsError) throw compositionsError;

            if (compositionsCount && compositionsCount > 0) {
                showError(`لا يمكن حذف نوع البن لأنه مستخدم في ${compositionsCount} توليفة.`);
                setShowDeleteDialog(false);
                return;
            }

            // Check for usage in roasting_sessions
            const { count: sessionsCount, error: sessionsError } = await supabase
                .from('roasting_sessions')
                .select('*', { count: 'exact', head: true })
                .eq('coffee_type_code', coffeeTypeToDelete.code);

            if (sessionsError) throw sessionsError;

            if (sessionsCount && sessionsCount > 0) {
                showError(`لا يمكن حذف نوع البن لأنه مستخدم في ${sessionsCount} جلسة تحميص.`);
                setShowDeleteDialog(false);
                return;
            }

            // If not used, proceed with deletion
            const { error: deleteError } = await supabase.from('coffee_types').delete().eq('code', coffeeTypeToDelete.code);
            if (deleteError) throw deleteError;

            showSuccess('تم حذف نوع البن بنجاح.');
            queryClient.invalidateQueries({ queryKey: ['coffeeTypes'] });
        } catch (error: any) {
            showError(`حدث خطأ: ${error.message}`);
        } finally {
            setShowDeleteDialog(false);
            setCoffeeTypeToDelete(null);
        }
    };

    return (
        <>
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold">إدارة أنواع البن وأسعارها</h1>
                <Button onClick={handleAddNew}>
                    <PlusCircle className="ml-2 h-4 w-4" />
                    إضافة نوع بن جديد
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>قائمة أنواع البن</CardTitle>
                    <CardDescription>
                        هنا يمكنك رؤية وإدارة أسعار البن الأخضر والمحمص لكل نوع. الأسعار بالجنيه للكيلوجرام.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading && <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>}
                    {error && <p className="text-destructive text-center p-8">{(error as Error).message}</p>}
                    {coffeeTypes && (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>الاسم</TableHead>
                                        <TableHead>سعر الأخضر</TableHead>
                                        <TableHead>سعر الفاتح</TableHead>
                                        <TableHead>سعر الوسط</TableHead>
                                        <TableHead>سعر الغامق</TableHead>
                                        <TableHead>الحالة</TableHead>
                                        <TableHead></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {coffeeTypes.map(coffeeType => (
                                        <TableRow key={coffeeType.code}>
                                            <TableCell className="font-medium">
                                                <div>{coffeeType.name_ar}</div>
                                                <div className="text-xs text-muted-foreground font-mono">{coffeeType.code}</div>
                                            </TableCell>
                                            <TableCell>{coffeeType.price_green_kg || 0}</TableCell>
                                            <TableCell>{coffeeType.price_light_kg || 0}</TableCell>
                                            <TableCell>{coffeeType.price_medium_kg || 0}</TableCell>
                                            <TableCell>{coffeeType.price_dark_kg || 0}</TableCell>
                                            <TableCell>
                                                <Badge variant={coffeeType.is_active ? 'default' : 'outline'}>
                                                    {coffeeType.is_active ? 'نشط' : 'غير نشط'}
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
                                                        <DropdownMenuItem onClick={() => handleEdit(coffeeType)}>
                                                            <Edit className="ml-2 h-4 w-4" />
                                                            <span>تعديل</span>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleDelete(coffeeType)} className="text-destructive focus:text-destructive">
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
                        </div>
                    )}
                </CardContent>
            </Card>

            <CoffeeTypeForm
                isOpen={showForm}
                setIsOpen={setShowForm}
                coffeeType={selectedCoffeeType}
            />

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent dir="rtl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
                        <AlertDialogDescription>
                            هل تريد بالتأكيد حذف "{coffeeTypeToDelete?.name_ar}"؟ قد يؤثر هذا على التوليفات التي تستخدم هذا النوع.
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

export default CoffeeTypesManager;