import { memo } from 'react';
import { HelpCircle, Facebook, Pin, Youtube, Linkedin, Twitter } from 'lucide-react';
import { useLanguage } from '@/contexts/useLanguage';

export const Footer = memo(function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-gradient-to-r from-blue-700 to-blue-600 text-white mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center flex-col gap-6">
          {/* Center: Copyright and Course Info */}
          <div className="text-center">
            <p className="text-sm font-medium">{t('footer.copyright')}</p>
            <p className="text-sm opacity-90">{t('footer.course')}</p>
          </div>

          {/* Social Media Icons */}
          <div className="flex items-center gap-4">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center hover:bg-blue-700 transition-colors shadow-md"
              aria-label="Facebook"
            >
              <Facebook className="h-5 w-5 text-white" />
            </a>
            <a
              href="https://pinterest.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 bg-red-600 rounded flex items-center justify-center hover:bg-red-700 transition-colors shadow-md"
              aria-label="Pinterest"
            >
              <Pin className="h-5 w-5 text-white" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 bg-cyan-500 rounded flex items-center justify-center hover:bg-cyan-600 transition-colors shadow-md"
              aria-label="Twitter"
            >
              <Twitter className="h-5 w-5 text-white" />
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 bg-red-600 rounded flex items-center justify-center hover:bg-red-700 transition-colors shadow-md"
              aria-label="YouTube"
            >
              <Youtube className="h-5 w-5 text-white" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 bg-blue-700 rounded flex items-center justify-center hover:bg-blue-800 transition-colors shadow-md"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-5 w-5 text-white" />
            </a>
          </div>
        </div>
      </div>

      {/* Help Button - Fixed Position */}
      <button
        className="fixed bottom-6 right-6 w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center text-white hover:bg-gray-700 transition-colors shadow-lg z-50"
        aria-label="Help"
      >
        <HelpCircle className="h-5 w-5" />
      </button>
    </footer>
  );
});

