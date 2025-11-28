import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <header className="bg-[#0A84D6] text-white">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Logo and University Name */}
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 bg-white rounded">
              <span className="text-[#0A84D6] font-bold text-xl">BK</span>
            </div>
            <div className="flex flex-col">
              <p className="text-xs leading-tight">
                ĐẠI HỌC QUỐC GIA THÀNH PHỐ HỒ CHÍ MINH
              </p>
              <p className="text-sm font-semibold leading-tight">
                TRƯỜNG ĐẠI HỌC BÁCH KHOA
              </p>
            </div>
          </div>

          {/* Right: Language Selector */}
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
              EN
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

