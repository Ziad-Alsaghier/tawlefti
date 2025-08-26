import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { RoastingSession } from '@/types/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Loader2, Flame } from 'lucide-react';
import RoastSessionForm from '@/components/admin/RoastSessionForm';

interface RoastingSessionWithDetails extends RoastingSession {
    coffee_types: { name_ar: string } | null;
    profiles: { full_name: string | null } | null;
}

const fetchRoastingSessions = async (): Promise<RoastingSessionWithDetails[]> => {
    const { data, error } = await supabase
        .from('roasting_sessions')
        .select(`*, coffee_types(name_ar), profiles(full_name)`)
        .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data as RoastingSessionWithDetails[];
};

const RoasteryManager = () => {
    const [showForm, setShowForm] = useState(false);
    const { data: sessions, isLoading, error } = useQuery<RoastingSessionWithDetails[]>({
        queryKey: ['roastingSessions'],
        queryFn: fetchRoastingSessions,
    });

    const roastLevelLabels: Record<string, string> = {
        light: 'فاتح',
        medium: 'وسط',
        dark: 'غامق',
    };

    return (
        <>
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">إدارة المحمصة</h1>
                        <p className="text-muted-foreground mt-2">سجل عمليات التحميص وقم بإدارة مخزونك من البن المحمص.</p>
                    </div>
                    <Button onClick={() => setShowForm(true)}>
                        <PlusCircle className="ml-2 h-4 w-4" />
                        جلسة تحميص جديدة
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Flame /> سجل جلسات التحميص</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading && <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>}
                        {error && <p className="text-destructive text-center p-8">{(error as Error).message}</p>}
                        {sessions && (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>التاريخ</TableHead>
                                        <TableHead>نوع البن</TableHead>
                                        <TableHead>درجة التحميص</TableHead>
                                        <TableHead>الكمية الداخلة (أخضر)</TableHead>
                                        <TableHead>الكمية الناتجة (محمص)</TableHead>
                                        <TableHead>بواسطة</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sessions.map(s => (
                                        <TableRow key={s.id}>
                                            <TableCell>{new Date(s.created_at).toLocaleString('ar-EG')}</TableCell>
                                            <TableCell>{s.coffee_types?.name_ar || s.coffee_type_code}</TableCell>
                                            <TableCell>{roastLevelLabels[s.roast_level] || s.roast_level}</TableCell>
                                            <TableCell className="font-medium text-green-600">{s.green_kg_in.toFixed(2)} كجم</TableCell>
                                            <TableCell className="font-medium text-yellow-700">{s.roasted_kg_out.toFixed(2)} كجم</TableCell>
                                            <TableCell>{s.profiles?.full_name || 'غير محدد'}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
            <RoastSessionForm isOpen={showForm} setIsOpen={setShowForm} />
        </>
    );
};

export default RoasteryManager;