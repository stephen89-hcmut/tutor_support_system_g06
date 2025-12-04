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
    // Progress Screen
    'progress.title': 'Tiến Độ Học Tập Của Tôi',
    'progress.overall': 'Hiệu Suất Tổng Thể',
    'progress.understanding': 'Hiểu Bài',
    'progress.problemsolving': 'Giải Quyết Vấn Đề',
    'progress.codequality': 'Chất Lượng Code',
    'progress.participation': 'Tham Gia',
    'progress.overtime': 'Tiến Độ Theo Thời Gian',
    'progress.skills': 'Hồ Sơ Kỹ Năng',
    'progress.sessionhistory': 'Lịch Sử Buổi Học',
    'progress.statistics': 'Thống Kê',
    'progress.tutor': 'Gia sư',
    'progress.tutorcomments': 'Nhận Xét Của Gia Sư',
    'progress.nosessions': 'Bạn chưa có bất kỳ buổi học nào được hoàn thành.',
    'progress.breadcrumb.dashboard': 'Bảng Điều Khiển',
    'progress.breadcrumb.progress': 'Tiến Độ Học Tập',
    'progress.back': 'Quay Lại',
    // Common
    'common.loading': 'Đang tải...',
    'common.error': 'Lỗi',
    'common.success': 'Thành công',
    'common.save': 'Lưu',
    'common.cancel': 'Hủy',
    'common.delete': 'Xóa',
    'common.edit': 'Sửa',
    'common.view': 'Xem',
    'common.search': 'Tìm kiếm',
  },
  en: {
    'header.university': 'VIET NAM NATIONAL UNIVERSITY HO CHI MINH CITY',
    'header.school': 'HO CHI MINH CITY UNIVERSITY OF TECHNOLOGY',
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
    // Progress Screen
    'progress.title': 'My Learning Progress',
    'progress.overall': 'Overall Performance',
    'progress.understanding': 'Understanding',
    'progress.problemsolving': 'Problem Solving',
    'progress.codequality': 'Code Quality',
    'progress.participation': 'Participation',
    'progress.overtime': 'Progress Over Time',
    'progress.skills': 'Skills Profile',
    'progress.sessionhistory': 'Session History',
    'progress.statistics': 'Statistics',
    'progress.tutor': 'Tutor',
    'progress.tutorcomments': 'Tutor Comments',
    'progress.nosessions': 'You have no completed sessions yet.',
    'progress.breadcrumb.dashboard': 'Dashboard',
    'progress.breadcrumb.progress': 'Learning Progress',
    'progress.back': 'Back',
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.view': 'View',
    'common.search': 'Search',
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
