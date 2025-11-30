import { useState, ReactNode } from 'react';
import { LanguageContext, Language, type LanguageContextType } from './LanguageContextType';

export type { Language, LanguageContextType };
export { LanguageContext };

const translations: Record<Language, Record<string, string>> = {
  vi: {
    'header.university': 'ĐẠI HỌC QUỐC GIA THÀNH PHỐ HỒ CHÍ MINH',
    'header.school': 'TRƯỜNG ĐẠI HỌC BÁCH KHOA',
    'footer.copyright': 'Copyright © 2025 - Trường Đại học Bách Khoa TPHCM',
    'footer.course': 'Software Engineering L06',
    'nav.dashboard': 'Bảng điều khiển',
    'nav.meetings': 'Buổi học',
    'nav.mystudents': 'Sinh viên của tôi',
    'nav.feedback': 'Phản hồi',
    'nav.documentlibrary': 'Thư viện tài liệu',
    'nav.settings': 'Cài đặt',
    'profile.view': 'Xem hồ sơ',
    'profile.signout': 'Đăng xuất',
    'login.email': 'Email',
    'login.password': 'Mật khẩu',
    'login.signin': 'Đăng nhập',
    'login.remember': 'Ghi nhớ tôi',
  },
  en: {
    'header.university': 'NATIONAL UNIVERSITY OF HO CHI MINH CITY',
    'header.school': 'BACH KHOA UNIVERSITY',
    'footer.copyright': 'Copyright © 2025 - Bach Khoa University HCMC',
    'footer.course': 'Software Engineering L06',
    'nav.dashboard': 'Dashboard',
    'nav.meetings': 'Meetings',
    'nav.mystudents': 'My Students',
    'nav.feedback': 'Feedback',
    'nav.documentlibrary': 'Document Library',
    'nav.settings': 'Settings',
    'profile.view': 'View Profile',
    'profile.signout': 'Sign Out',
    'login.email': 'Email',
    'login.password': 'Password',
    'login.signin': 'Sign In',
    'login.remember': 'Remember me',
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('vi');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}
