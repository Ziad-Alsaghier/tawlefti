import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, UserCog } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { showSuccess, showError } from '@/utils/toast';

const fetchProfiles = async (): Promise<Profile[]> => {
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) throw new Error(error.message);
    return data;
};

const UsersManager = () => {
    const queryClient = useQueryClient();
    const { data: profiles, isLoading, error } = useQuery<Profile[]>({
        queryKey: ['profiles'],
        queryFn: fetchProfiles,
    });

    const handleRoleChange = async (userId: string, newRole: string) => {
        const { error } = await supabase
            .from('profiles')
            .update({ role: newRole })
            .eq('id', userId);

        if (error) {
            showError(`فشل تحديث الصلاحية: ${error.message}`);
        } else {
            showSuccess('تم تحديث صلاحية المستخدم بنجاح.');
            queryClient.invalidateQueries({ queryKey: ['profiles'] });
        }
    };

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold">إدارة المستخدمين</h1>
                <p className="text-muted-foreground mt-2">عرض وتعديل صلاحيات المستخدمين المسجلين في النظام.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><UserCog /> قائمة المستخدمين</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading && <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>}
                    {error && <p className="text-destructive text-center p-8">{(error as Error).message}</p>}
                    {profiles && (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>الاسم الكامل</TableHead>
                                    <TableHead>رقم الهاتف</TableHead>
                                    <TableHead>الصلاحية</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {profiles.map(profile => (
                                    <TableRow key={profile.id}>
                                        <TableCell className="font-medium">{profile.full_name || 'غير مسجل'}</TableCell>
                                        <TableCell dir="ltr" className="text-left">{profile.phone_number || 'غير مسجل'}</TableCell>
                                        <TableCell>
                                            <Select
                                                value={profile.role || 'user'}
                                                onValueChange={(value) => handleRoleChange(profile.id, value)}
                                            >
                                                <SelectTrigger className="w-[130px]">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="user">مستخدم</SelectItem>
                                                    <SelectItem value="roaster">محمصة</SelectItem>
                                                    <SelectItem value="admin">مدير</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default UsersManager;