import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-muted/50 border-t mt-16">
            <div className="container mx-auto py-8 px-4 flex flex-col md:flex-row justify-between items-center text-center md:text-right">
                <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} تَولِيفتِي™. جميع الحقوق محفوظة.</p>
                <nav className="flex gap-4 mt-4 md:mt-0">
                    <Link to="/about" className="text-sm hover:underline">من نحن؟</Link>
                    <Link to="/faq" className="text-sm hover:underline">الأسئلة الشائعة</Link>
                    <Link to="/contact" className="text-sm hover:underline">اتصل بنا</Link>
                </nav>
            </div>
        </footer>
    );
};

export default Footer;