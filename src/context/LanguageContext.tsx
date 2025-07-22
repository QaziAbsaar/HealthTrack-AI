import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Language = 'en' | 'ur' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const translations = {
  en: {
    // Navigation
    reports: 'Reports',
    upload: 'Upload',
    calendar: 'Calendar',
    assistant: 'Assistant',
    settings: 'Settings',
    
    // Home Screen
    welcome: 'Welcome',
    recentReports: 'Recent Reports',
    noReports: 'No reports yet',
    uploadFirst: 'Upload your first medical report to get started',
    
    // Upload Screen
    uploadReport: 'Upload Report',
    takePhoto: 'Take Photo',
    selectFile: 'Select File',
    processing: 'Processing...',
    
    // Report Types
    bloodTest: 'Blood Test',
    prescription: 'Prescription',
    diagnostic: 'Diagnostic',
    xray: 'X-Ray',
    mri: 'MRI',
    ctScan: 'CT Scan',
    laboratory: 'Laboratory',
    vaccination: 'Vaccination',
    consultation: 'Consultation',
    other: 'Other',
    
    // Common
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    date: 'Date',
    type: 'Type',
    title: 'Title',
    
    // Settings
    theme: 'Theme',
    language: 'Language',
    notifications: 'Notifications',
    backup: 'Backup',
    about: 'About',
    
    // Assistant
    askQuestion: 'Ask a question about your health',
    chatPlaceholder: 'Type your message...',
    
    // Calendar
    upcomingReminders: 'Upcoming Reminders',
    addReminder: 'Add Reminder',
    appointment: 'Appointment',
    medication: 'Medication',
    test: 'Test',
    followUp: 'Follow-up',
  },
  ur: {
    // Navigation
    reports: 'رپورٹس',
    upload: 'اپ لوڈ',
    calendar: 'کیلنڈر',
    assistant: 'اسسٹنٹ',
    settings: 'سیٹنگز',
    
    // Home Screen
    welcome: 'خوش آمدید',
    recentReports: 'حالیہ رپورٹس',
    noReports: 'ابھی کوئی رپورٹ نہیں',
    uploadFirst: 'شروعات کے لیے اپنی پہلی میڈیکل رپورٹ اپ لوڈ کریں',
    
    // Upload Screen
    uploadReport: 'رپورٹ اپ لوڈ کریں',
    takePhoto: 'تصویر لیں',
    selectFile: 'فائل منتخب کریں',
    processing: 'پروسیسنگ...',
    
    // Report Types
    bloodTest: 'خون کا ٹیسٹ',
    prescription: 'نسخہ',
    diagnostic: 'تشخیصی',
    xray: 'ایکس رے',
    mri: 'ایم آر آئی',
    ctScan: 'سی ٹی اسکین',
    laboratory: 'لیبارٹری',
    vaccination: 'ویکسینیشن',
    consultation: 'مشاورت',
    other: 'دیگر',
    
    // Common
    save: 'محفوظ کریں',
    cancel: 'منسوخ',
    delete: 'ڈیلیٹ',
    edit: 'ترمیم',
    search: 'تلاش',
    filter: 'فلٹر',
    sort: 'ترتیب',
    date: 'تاریخ',
    type: 'قسم',
    title: 'عنوان',
    
    // Settings
    theme: 'تھیم',
    language: 'زبان',
    notifications: 'اطلاعات',
    backup: 'بیک اپ',
    about: 'کے بارے میں',
    
    // Assistant
    askQuestion: 'اپنی صحت کے بارے میں سوال پوچھیں',
    chatPlaceholder: 'اپنا پیغام ٹائپ کریں...',
    
    // Calendar
    upcomingReminders: 'آنے والی یاد دہانیاں',
    addReminder: 'یاد دہانی شامل کریں',
    appointment: 'اپائنٹمنٹ',
    medication: 'دوا',
    test: 'ٹیسٹ',
    followUp: 'فالو اپ',
  },
  ar: {
    // Navigation
    reports: 'التقارير',
    upload: 'رفع',
    calendar: 'التقويم',
    assistant: 'المساعد',
    settings: 'الإعدادات',
    
    // Home Screen
    welcome: 'مرحباً',
    recentReports: 'التقارير الحديثة',
    noReports: 'لا توجد تقارير بعد',
    uploadFirst: 'ارفع تقريرك الطبي الأول للبدء',
    
    // Upload Screen
    uploadReport: 'رفع التقرير',
    takePhoto: 'التقاط صورة',
    selectFile: 'اختيار ملف',
    processing: 'جاري المعالجة...',
    
    // Report Types
    bloodTest: 'فحص الدم',
    prescription: 'وصفة طبية',
    diagnostic: 'تشخيصي',
    xray: 'أشعة سينية',
    mri: 'رنين مغناطيسي',
    ctScan: 'أشعة مقطعية',
    laboratory: 'مختبر',
    vaccination: 'تطعيم',
    consultation: 'استشارة',
    other: 'أخرى',
    
    // Common
    save: 'حفظ',
    cancel: 'إلغاء',
    delete: 'حذف',
    edit: 'تحرير',
    search: 'بحث',
    filter: 'تصفية',
    sort: 'ترتيب',
    date: 'التاريخ',
    type: 'النوع',
    title: 'العنوان',
    
    // Settings
    theme: 'المظهر',
    language: 'اللغة',
    notifications: 'الإشعارات',
    backup: 'النسخ الاحتياطي',
    about: 'حول',
    
    // Assistant
    askQuestion: 'اسأل سؤالاً عن صحتك',
    chatPlaceholder: 'اكتب رسالتك...',
    
    // Calendar
    upcomingReminders: 'التذكيرات القادمة',
    addReminder: 'إضافة تذكير',
    appointment: 'موعد',
    medication: 'دواء',
    test: 'فحص',
    followUp: 'متابعة',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('language');
      if (savedLanguage && ['en', 'ur', 'ar'].includes(savedLanguage)) {
        setLanguageState(savedLanguage as Language);
      }
    } catch (error) {
      console.error('Error loading language:', error);
    }
  };

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    try {
      await AsyncStorage.setItem('language', lang);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  const isRTL = language === 'ur' || language === 'ar';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
