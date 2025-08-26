import { Outlet } from 'react-router-dom';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeToggle } from './ThemeToggle';
import { ProfileMenu } from './ProfileMenu';
import CartSheet from './CartSheet';
import Footer from './Footer';

const MainLayout = () => {
    return (
        <>
            <div className="absolute top-4 left-4 flex items-center gap-1 z-20">
                <LanguageSwitcher />
                <ThemeToggle />
                <ProfileMenu />
            </div>
            <CartSheet />
            <main>
                <Outlet />
            </main>
            <Footer />
        </>
    );
};

export default MainLayout;