import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  ListOrdered, Coffee, LogOut, Shield, Home, Settings, PackagePlus, Bean, 
  Archive, ShoppingCart, Tag, Users, Flame, MonitorPlay, UserCog,
  Wallet, BookOpen, TrendingUp, Receipt, Folder, SlidersHorizontal, PieChart, Package, Bell, Star, DollarSign, BarChart3, Building, Repeat, Banknote, FileText
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { motion } from 'framer-motion';

const AdminLayout = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const navGroups = [
    {
      title: 'التحليلات',
      items: [
        { to: '/admin/dashboard', icon: ListOrdered, label: 'لوحة التحكم' },
        { to: '/admin/analytics/advanced', icon: BarChart3, label: 'التحليلات المتقدمة' },
      ]
    },
    {
      title: 'العملاء والمستخدمين',
      items: [
        { to: '/admin/customers', icon: Users, label: 'العملاء' },
        { to: '/admin/users', icon: UserCog, label: 'المستخدمين' },
      ]
    },
    {
      title: 'المحاسبة',
      items: [
        { to: '/admin/accounting/summary', icon: PieChart, label: 'بيان الأرباح والخسائر' },
        { to: '/admin/accounting/ledger', icon: BookOpen, label: 'دفتر الأستاذ العام' },
        { to: '/admin/accounting/sales', icon: TrendingUp, label: 'تقارير المبيعات' },
        { to: '/admin/accounting/salaries', icon: Banknote, label: 'إدارة الرواتب' },
        { to: '/admin/accounting/expenses', icon: Receipt, label: 'إدارة المصروفات' },
        { to: '/admin/accounting/fixed-expenses', icon: Repeat, label: 'المصروفات الثابتة' },
        { to: '/admin/accounting/purchases', icon: ShoppingCart, label: 'سجل المشتريات' },
        { to: '/admin/accounting/suppliers', icon: Building, label: 'الموردين' },
        { to: '/admin/accounting/categories', icon: Folder, label: 'فئات المصروفات' },
        { to: '/admin/accounting/fixed-costs', icon: Package, label: 'التكاليف الثابتة للطلب' },
        { to: '/admin/accounting/roastery-payouts', icon: DollarSign, label: 'تكاليف المحامص' },
      ]
    },
    {
      title: 'العمليات والمنتجات',
      items: [
        { to: '/admin/roastery', icon: Flame, label: 'المحمصة' },
        { to: '/admin/inventory', icon: Archive, label: 'المخزون' },
        { to: '/admin/blends', icon: Coffee, label: 'التوليفات' },
        { to: '/admin/coffee-types', icon: Bean, label: 'أنواع البن' },
        { to: '/admin/additives', icon: PackagePlus, label: 'التحويجات' },
      ]
    },
    {
      title: 'إعدادات المتجر',
      items: [
        { to: '/admin/methods', icon: Settings, label: 'طرق التحضير' },
        { to: '/admin/discounts', icon: Tag, label: 'أكواد الخصم' },
        { to: '/admin/settings', icon: SlidersHorizontal, label: 'إعدادات المتجر' },
        { to: '/admin/loyalty-settings', icon: Star, label: 'برنامج الولاء' },
        { to: '/admin/notifications', icon: Bell, label: 'إدارة الإشعارات' },
        { to: '/admin/content', icon: FileText, label: 'إدارة المحتوى' },
      ]
    }
  ];

  const singleNavItems = [
    { to: '/live/operations', icon: MonitorPlay, label: 'شاشة العمليات الحية', target: '_blank' },
  ];

  return (
    <div className="min-h-screen w-full flex bg-muted/40" dir="rtl">
      <aside className="flex-col border-l bg-background/90 backdrop-blur-md sm:flex w-64">
        <div className="flex h-[60px] items-center border-b px-6">
          <NavLink to="/" className="flex items-center gap-2 font-semibold">
            <Shield className="h-6 w-6 text-primary" />
            <span className="">لوحة التحكم</span>
          </NavLink>
        </div>
        <nav className="flex-1 flex flex-col justify-between p-2 overflow-y-auto">
          <Accordion type="multiple" className="w-full" defaultValue={['المحاسبة']}>
            {navGroups.map((group) => (
              <AccordionItem value={group.title} key={group.title}>
                <AccordionTrigger className="text-sm font-semibold px-2 hover:no-underline">{group.title}</AccordionTrigger>
                <AccordionContent>
                  <ul className="grid items-start gap-1 font-medium p-2">
                    {group.items.map((item) => (
                      <li key={item.to}>
                        <NavLink
                          to={item.to}
                          end={item.to === '/admin/dashboard'}
                          className={({ isActive }) => cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary text-sm",
                            isActive && "bg-muted text-primary"
                          )}
                        >
                          <item.icon className="h-4 w-4" />
                          {item.label}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            ))}
            <div className="p-2">
              {singleNavItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  target={item.target}
                  className={({ isActive }) => cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary text-sm font-medium",
                    isActive && "bg-muted text-primary"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              ))}
            </div>
          </Accordion>
          <div className="space-y-2 mt-4 p-2 border-t">
             <Button variant="ghost" className="w-full justify-start" onClick={() => navigate('/profile')}>
              <UserCog className="ml-2 h-4 w-4" />
              ملفي الشخصي
            </Button>
             <Button variant="ghost" className="w-full justify-start" onClick={() => navigate('/')}>
              <Home className="ml-2 h-4 w-4" />
              العودة للموقع
            </Button>
            <Button variant="ghost" className="w-full justify-start" onClick={handleSignOut}>
              <LogOut className="ml-2 h-4 w-4" />
              تسجيل الخروج
            </Button>
          </div>
        </nav>
      </aside>
      <main className="flex-1 flex flex-col">
        <div className="flex-1 p-4 sm:p-8 overflow-auto">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, ease: 'easeOut' }}
            className="page-enter"
          >
            <Outlet />
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;