import { memo } from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '@/contexts/useLanguage';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const Header = memo(function Header() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="bg-gradient-to-r from-blue-700 to-blue-500 text-white">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Logo and University Name */}
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-16 h-16 bg-white rounded-lg shadow-lg">
              <div className="text-center">
                <div className="text-blue-700 font-bold text-lg">BK</div>
                <div className="text-blue-500 font-semibold text-xs">TP.HCM</div>
              </div>
            </div>
            <div className="flex flex-col">
              <p className="text-xs font-light leading-tight opacity-90">
                {t('header.university')}
              </p>
              <p className="text-sm font-bold leading-tight">
                {t('header.school')}
              </p>
            </div>
          </div>

          {/* Right: Language Selector */}
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <Select value={language} onValueChange={(value: any) => setLanguage(value)}>
              <SelectTrigger className="w-24 bg-white/20 border-white/30 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vi">Tiếng Việt</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </header>
  );
});

