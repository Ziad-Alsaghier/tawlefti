import { useState, useMemo } from 'react';
import { Blend } from '@/types/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { PlusCircle, MoreHorizontal, Trash2, Edit, Loader2, ChevronDown, Settings, Tag, Info, Coffee } from 'lucide-react';
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
import BlendForm from '@/components/admin/BlendForm';
import { getMethodById, coffeeMethods, getParentMethodId } from '@/data/coffeeData';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { fetchBlends } from '@/queries/blends';
import { supabase } from '@/integrations/supabase/client';

const BlendsManager = () => {
    const queryClient = useQueryClient();
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showBlendForm, setShowBlendForm] = useState(false);
    const [selectedBlend, setSelectedBlend] = useState<Blend | null>(null);
    const [blendToDelete, setBlendToDelete] = useState<Blend | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [methodFilter, setMethodFilter] = useState('all');

    const { data: blends, isLoading, error } = useQuery<Blend[]>({
        queryKey: ['blends'],
        queryFn: fetchBlends,
    });

    const filteredBlends = useMemo(() => {
        if (!blends) return [];
        return blends.filter(blend => {
            const searchMatch = searchTerm.toLowerCase() === '' ||
                blend.name_ar.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (blend.name_en && blend.name_en.toLowerCase().includes(searchTerm.toLowerCase())) ||
                blend.code.toLowerCase().includes(searchTerm.toLowerCase());
            
            if (methodFilter === 'all') return searchMatch;
            if (methodFilter === 'functional') return searchMatch && blend.display_category === 'وظيفية';

            const parentMethod = coffeeMethods.find(m => m.id === methodFilter);
            let idsToMatch: string[] = [methodFilter];
            if (parentMethod && parentMethod.subMethods) {
                idsToMatch.push(...parentMethod.subMethods.map(sm => sm.id));
            }
            
            const methodMatch = blend.method_id ? idsToMatch.includes(blend.method_id) : false;
            return searchMatch && methodMatch;
        });
    }, [blends, searchTerm, methodFilter]);

    const groupedBlends = useMemo(() => {
        if (!filteredBlends) return {};
        
        const functionalGroupName = 'توليفات على المزاج';
        const uncategorizedGroupName = 'غير مصنف';
        
        const groups: Record<string, Blend[]> = {};

        for (const blend of filteredBlends) {
            let groupName: string;
            if (blend.display_category === 'وظيفية') {
                groupName = functionalGroupName;
            } else {
                const method = getMethodById(blend.method_id || '');
                const parentId = method ? (getParentMethodId(method.id) || method.id) : uncategorizedGroupName;
                const parentMethod = getMethodById(parentId);
                groupName = parentMethod ? parentMethod.name.ar : uncategorizedGroupName;
            }
            
            if (!groups[groupName]) {
                groups[groupName] = [];
            }
            groups[groupName].push(blend);
        }

        const orderedGroupNames = [functionalGroupName, ...coffeeMethods.map(m => m.name.ar)];
        if (groups[uncategorizedGroupName]) {
            orderedGroupNames.push(uncategorizedGroupName);
        }

        const sortedGroups: Record<string, Blend[]> = {};
        orderedGroupNames.forEach(name => {
            if (groups[name]) {
                sortedGroups[name] = groups[name];
            }
        });

        return sortedGroups;
    }, [filteredBlends]);

    const handleAddNew = () => {
        setSelectedBlend(null);
        setShowBlendForm(true);
    };

    const handleEdit = (blend: Blend) => {
        setSelectedBlend(blend);
        setShowBlendForm(true);
    };

    const handleDelete = (blend: Blend) => {
        setBlendToDelete(blend);
        setShowDeleteDialog(true);
    };

    const confirmDelete = async () => {
        if (!blendToDelete) return;
        const { error } = await supabase.from('blends').delete().eq('code', blendToDelete.code);
        if (error) {
            showError(`فشل حذف التوليفة: ${error.message}`);
        } else {
            showSuccess('تم حذف التوليفة بنجاح.');
            queryClient.invalidateQueries({ queryKey: ['blends'] });
        }
        setShowDeleteDialog(false);
        setBlendToDelete(null);
    };

    const handleToggleActive = async (blend: Blend) => {
        const newStatus = !blend.is_active;
        const { error } = await supabase.from('blends').update({ is_active: newStatus }).eq('code', blend.code);
        if (error) {
            showError(`فشل تحديث الحالة: ${error.message}`);
        } else {
            showSuccess(`تم تغيير حالة "${blend.name_ar}" إلى ${newStatus ? 'نشط' : 'غير نشط'}.`);
            queryClient.invalidateQueries({ queryKey: ['blends'] });
        }
    };

    return (
        <>
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold">إدارة التوليفات</h1>
                <Button onClick={handleAddNew}><PlusCircle className="ml-2 h-4 w-4" />إضافة توليفة جديدة</Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>قائمة التوليفات</CardTitle>
                    <CardDescription>ابحث عن التوليفات أو قم بفلترتها حسب طريقة التحضير.</CardDescription>
                    <div className="flex items-center gap-4 pt-4">
                        <Input placeholder="ابحث بالاسم أو الكود..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="max-w-sm" />
                        <Select value={methodFilter} onValueChange={setMethodFilter}>
                            <SelectTrigger className="w-[220px]"><SelectValue placeholder="فلترة حسب الطريقة" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">كل التوليفات</SelectItem>
                                <SelectItem value="functional">توليفات على المزاج فقط</SelectItem>
                                {coffeeMethods.map(method => (
                                    <SelectGroup key={method.id}>
                                        <SelectLabel>{method.name.ar}</SelectLabel>
                                        <SelectItem value={method.id}>{method.name.ar} (كل الفئة)</SelectItem>
                                    </SelectGroup>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading && <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>}
                    {error && <p className="text-destructive text-center p-8">{(error as Error).message}</p>}
                    <div className="space-y-4">
                        {Object.entries(groupedBlends).map(([groupName, blendsInGroup]) => (
                            <Collapsible key={groupName} defaultOpen className="border rounded-lg">
                                <CollapsibleTrigger className="w-full flex items-center justify-between p-4 bg-muted/50 rounded-t-lg cursor-pointer">
                                    <h3 className="text-lg font-semibold">{groupName} ({blendsInGroup.length})</h3>
                                    <ChevronDown className="h-5 w-5 transition-transform data-[state=open]:rotate-180" />
                                </CollapsibleTrigger>
                                <CollapsibleContent className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {blendsInGroup.map(blend => (
                                        <Card key={blend.code} className="flex flex-col">
                                            <CardHeader>
                                                <CardTitle>{blend.name_ar}</CardTitle>
                                                <CardDescription>الكود: {blend.code}</CardDescription>
                                            </CardHeader>
                                            <CardContent className="flex-grow space-y-2">
                                                {blend.display_category === 'وظيفية' ? (
                                                    <div className="flex items-center gap-2 text-sm text-amber-600"><Coffee className="h-4 w-4" /><span>توليفة على المزاج</span></div>
                                                ) : (
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground"><Settings className="h-4 w-4" /><span>{getMethodById(blend.method_id)?.name.ar || 'غير محدد'}</span></div>
                                                )}
                                                {blend.manual_price && <div className="flex items-center gap-2 text-sm text-primary"><Tag className="h-4 w-4" /><span>سعر يدوي: {blend.manual_price} جنيه</span></div>}
                                                <div className="text-xs text-muted-foreground pt-2">
                                                    <h4 className="font-semibold mb-1">المكونات:</h4>
                                                    {blend.blend_compositions && blend.blend_compositions.length > 0 ? (
                                                        <ul className="list-disc list-inside">
                                                            {blend.blend_compositions.map(c => <li key={c.coffee_type_code}>{c.coffee_types?.name_ar}: {c.percentage}%</li>)}
                                                        </ul>
                                                    ) : <p>لا توجد مكونات.</p>}
                                                </div>
                                            </CardContent>
                                            <CardFooter className="flex justify-between items-center bg-muted/30 p-3">
                                                <div className="flex items-center space-x-2 space-x-reverse">
                                                    <Switch id={`active-${blend.code}`} checked={blend.is_active} onCheckedChange={() => handleToggleActive(blend)} />
                                                    <Label htmlFor={`active-${blend.code}`}>نشط</Label>
                                                </div>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleEdit(blend)}><Edit className="ml-2 h-4 w-4" /><span>تعديل</span></DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleDelete(blend)} className="text-destructive focus:text-destructive"><Trash2 className="ml-2 h-4 w-4" /><span>حذف</span></DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </CardFooter>
                                        </Card>
                                    ))}
                                </CollapsibleContent>
                            </Collapsible>
                        ))}
                        {filteredBlends.length === 0 && !isLoading && (
                            <div className="text-center p-8 text-muted-foreground flex flex-col items-center gap-4">
                                <Info className="h-8 w-8" />
                                لا توجد توليفات تطابق بحثك.
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <BlendForm isOpen={showBlendForm} setIsOpen={setShowBlendForm} blend={selectedBlend} />

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent dir="rtl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
                        <AlertDialogDescription>هل تريد بالتأكيد حذف التوليفة "{blendToDelete?.name_ar}"؟ لا يمكن التراجع عن هذا الإجراء.</AlertDialogDescription>
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

export default BlendsManager;