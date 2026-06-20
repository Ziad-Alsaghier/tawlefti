import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
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
                <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                    className="page-enter"
                >
                    <Outlet />
                </motion.div>
            </main>
            <Footer />
        </>
    );
};

export default MainLayout;