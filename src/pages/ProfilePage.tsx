import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import FullPageLoader from '@/components/FullPageLoader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, ShoppingCart, Heart, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import EditProfileForm from '@/components/profile/EditProfileForm';
import OrderHistoryTab from '@/components/profile/OrderHistoryTab';
import WishlistTab from '@/components/profile/WishlistTab';

const ProfilePage = () => {
    const { user, profile, signOut, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    if (authLoading) {
        return <FullPageLoader />;
    }

    if (!profile || !user) {
        navigate('/login');
        return <FullPageLoader />;
    }

    return (
        <div className="min-h-screen bg-muted/40 p-4 sm:p-8" dir="rtl">
            <div className="container mx-auto max-w-5xl space-y-8">
                <header className="text-center pt-12">
                    <h1 className="text-4xl font-bold font-kufam">ملفي الشخصي</h1>
                    <p className="text-muted-foreground">مرحباً بك، {profile.full_name}!</p>
                </header>

                <Tabs defaultValue="info" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="info"><User className="ml-2 h-4 w-4" /> معلوماتي</TabsTrigger>
                        <TabsTrigger value="orders"><ShoppingCart className="ml-2 h-4 w-4" /> طلباتي</TabsTrigger>
                        <TabsTrigger value="wishlist"><Heart className="ml-2 h-4 w-4" /> المفضلة</TabsTrigger>
                    </TabsList>
                    <TabsContent value="info">
                        <EditProfileForm />
                    </TabsContent>
                    <TabsContent value="orders">
                        <OrderHistoryTab />
                    </TabsContent>
                    <TabsContent value="wishlist">
                        <WishlistTab />
                    </TabsContent>
                </Tabs>

                <div className="flex justify-center gap-4">
                    <Button variant="link" onClick={() => navigate('/')}>العودة للرئيسية</Button>
                    <Button onClick={handleSignOut} variant="outline">
                        <LogOut className="ml-2 h-4 w-4" />
                        تسجيل الخروج
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;