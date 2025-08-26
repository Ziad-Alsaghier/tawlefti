import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';

export const LanguageSwitcher = () => {
  const { toggleLanguage, t } = useLanguage();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleLanguage}
      className="h-10 w-10 rounded-full text-lg font-bold"
      aria-label="Toggle language"
    >
      {t('language_switcher')}
    </Button>
  );
};