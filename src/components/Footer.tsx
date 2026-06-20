import { Link } from 'react-router-dom';

const Footer = () => {
    return (
   <footer className="relative mt-20 bg-gradient-to-br from-gray-900 via-gray-950 to-black border-t border-primary/40">
    {/* Decorative gradient line */}
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-yellow-400"></div>

    <div className="container mx-auto py-10 px-6 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-right">
        {/* Copyright */}
        <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} <span className="font-bold text-primary">تَولِيفتِي™</span>. جميع الحقوق محفوظة.
        </p>

        {/* Navigation */}
        <nav className="flex flex-wrap justify-center md:justify-end gap-6">
            <Link to="/about" className="text-sm text-gray-300 hover:text-primary transition-colors">
                من نحن؟
            </Link>
            <Link to="/faq" className="text-sm text-gray-300 hover:text-primary transition-colors">
                الأسئلة الشائعة
            </Link>
            <Link to="/contact" className="text-sm text-gray-300 hover:text-primary transition-colors">
                اتصل بنا
            </Link>
        </nav>
    </div>
</footer>

    );
};

export default Footer;
