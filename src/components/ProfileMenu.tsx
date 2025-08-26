import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, LogOut, LayoutDashboard } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export const ProfileMenu = () => {
  const { user, profile, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return null; // لا تظهر أي شيء أثناء تحميل الجلسة الأولية
  }

  if (!user) {
    return (
      <Button variant="ghost" onClick={() => navigate('/login')}>
        {t('login_button')}
      </Button>
    );
  }

  const getInitials = (name: string | null | undefined) => {
    if (!name) return <User className="h-5 w-5" />;
    const names = name.trim().split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarFallback>{getInitials(profile?.full_name)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{profile?.full_name || t('profile_menu_user_fallback')}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/profile')}>
          <User className="ml-2 h-4 w-4" />
          <span>{t('profile_menu_my_profile')}</span>
        </DropdownMenuItem>
        {profile?.role === 'admin' && (
          <DropdownMenuItem onClick={() => navigate('/admin/dashboard')}>
            <LayoutDashboard className="ml-2 h-4 w-4" />
            <span>{t('profile_menu_dashboard')}</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="ml-2 h-4 w-4" />
          <span>{t('profile_menu_logout')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};