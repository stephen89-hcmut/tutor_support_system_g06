import { HelpCircle, Youtube, Linkedin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#0A84D6] text-white mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          {/* Left: Copyright */}
          <div className="flex flex-col">
            <p className="text-sm">Copyright © 2025 - Trường Đại học Bách Khoa TPHCM</p>
            <p className="text-sm">Software Engineering L06</p>
          </div>

          {/* Right: Social Media Icons */}
          <div className="flex items-center gap-3">
            <a
              href="#"
              className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center hover:bg-blue-700 transition-colors"
              aria-label="Facebook"
            >
              <span className="text-white font-bold text-xs">f</span>
            </a>
            <a
              href="#"
              className="w-8 h-8 bg-red-600 rounded flex items-center justify-center hover:bg-red-700 transition-colors"
              aria-label="Pinterest"
            >
              <span className="text-white font-bold text-xs">P</span>
            </a>
            <a
              href="#"
              className="w-8 h-8 bg-red-500 rounded flex items-center justify-center hover:bg-red-600 transition-colors"
              aria-label="YouTube"
            >
              <Youtube className="h-4 w-4 text-white" />
            </a>
            <a
              href="#"
              className="w-8 h-8 bg-blue-700 rounded flex items-center justify-center hover:bg-blue-800 transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-4 w-4 text-white" />
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
}

