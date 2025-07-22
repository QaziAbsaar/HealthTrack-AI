/**
 * Language utilities for internationalization and RTL support
 */

export type SupportedLanguage = 'en' | 'ur' | 'ar';

export interface LanguageInfo {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  isRTL: boolean;
  dateFormat: string;
  numberFormat: string;
}

export const SUPPORTED_LANGUAGES: Record<SupportedLanguage, LanguageInfo> = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    isRTL: false,
    dateFormat: 'MM/DD/YYYY',
    numberFormat: 'en-US',
  },
  ur: {
    code: 'ur',
    name: 'Urdu',
    nativeName: 'اردو',
    isRTL: true,
    dateFormat: 'DD/MM/YYYY',
    numberFormat: 'ur-PK',
  },
  ar: {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    isRTL: true,
    dateFormat: 'DD/MM/YYYY',
    numberFormat: 'ar-SA',
  },
};

class LangUtils {
  
  /**
   * Get language information
   */
  getLanguageInfo(language: SupportedLanguage): LanguageInfo {
    return SUPPORTED_LANGUAGES[language];
  }

  /**
   * Check if language is RTL
   */
  isRTL(language: SupportedLanguage): boolean {
    return SUPPORTED_LANGUAGES[language].isRTL;
  }

  /**
   * Get text direction for styling
   */
  getTextDirection(language: SupportedLanguage): 'ltr' | 'rtl' {
    return this.isRTL(language) ? 'rtl' : 'ltr';
  }

  /**
   * Get text alignment for RTL support
   */
  getTextAlign(language: SupportedLanguage, defaultAlign: 'left' | 'right' | 'center' = 'left'): 'left' | 'right' | 'center' {
    if (defaultAlign === 'center') return 'center';
    
    if (this.isRTL(language)) {
      return defaultAlign === 'left' ? 'right' : 'left';
    }
    
    return defaultAlign;
  }

  /**
   * Format date according to language preference
   */
  formatDate(date: Date, language: SupportedLanguage): string {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };

    try {
      return new Intl.DateTimeFormat(SUPPORTED_LANGUAGES[language].numberFormat, options).format(date);
    } catch (error) {
      // Fallback to basic formatting
      return date.toLocaleDateString();
    }
  }

  /**
   * Format time according to language preference
   */
  formatTime(date: Date, language: SupportedLanguage): string {
    const options: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
    };

    try {
      return new Intl.DateTimeFormat(SUPPORTED_LANGUAGES[language].numberFormat, options).format(date);
    } catch (error) {
      // Fallback to basic formatting
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  }

  /**
   * Format numbers according to language preference
   */
  formatNumber(number: number, language: SupportedLanguage): string {
    try {
      return new Intl.NumberFormat(SUPPORTED_LANGUAGES[language].numberFormat).format(number);
    } catch (error) {
      return number.toString();
    }
  }

  /**
   * Format medical values with proper number formatting
   */
  formatMedicalValue(value: number | string, unit: string, language: SupportedLanguage): string {
    if (typeof value === 'string') {
      return `${value} ${unit}`;
    }
    
    const formattedNumber = this.formatNumber(value, language);
    return `${formattedNumber} ${unit}`;
  }

  /**
   * Get relative time string (e.g., "2 hours ago", "in 3 days")
   */
  getRelativeTime(date: Date, language: SupportedLanguage): string {
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    const isPast = diffMs < 0;
    const absValue = Math.abs;

    // Get localized strings based on language
    const strings = this.getRelativeTimeStrings(language);

    if (Math.abs(diffMins) < 1) {
      return strings.now;
    } else if (Math.abs(diffMins) < 60) {
      const mins = absValue(diffMins);
      if (isPast) {
        return strings.minutesAgo.replace('{0}', mins.toString());
      } else {
        return strings.inMinutes.replace('{0}', mins.toString());
      }
    } else if (Math.abs(diffHours) < 24) {
      const hours = absValue(diffHours);
      if (isPast) {
        return strings.hoursAgo.replace('{0}', hours.toString());
      } else {
        return strings.inHours.replace('{0}', hours.toString());
      }
    } else {
      const days = absValue(diffDays);
      if (isPast) {
        return strings.daysAgo.replace('{0}', days.toString());
      } else {
        return strings.inDays.replace('{0}', days.toString());
      }
    }
  }

  /**
   * Get localized relative time strings
   */
  private getRelativeTimeStrings(language: SupportedLanguage) {
    const strings = {
      en: {
        now: 'Now',
        minutesAgo: '{0} minutes ago',
        hoursAgo: '{0} hours ago',
        daysAgo: '{0} days ago',
        inMinutes: 'In {0} minutes',
        inHours: 'In {0} hours',
        inDays: 'In {0} days',
      },
      ur: {
        now: 'ابھی',
        minutesAgo: '{0} منٹ پہلے',
        hoursAgo: '{0} گھنٹے پہلے',
        daysAgo: '{0} دن پہلے',
        inMinutes: '{0} منٹ میں',
        inHours: '{0} گھنٹے میں',
        inDays: '{0} دن میں',
      },
      ar: {
        now: 'الآن',
        minutesAgo: 'منذ {0} دقائق',
        hoursAgo: 'منذ {0} ساعات',
        daysAgo: 'منذ {0} أيام',
        inMinutes: 'خلال {0} دقائق',
        inHours: 'خلال {0} ساعات',
        inDays: 'خلال {0} أيام',
      },
    };

    return strings[language];
  }

  /**
   * Get language-specific font family
   */
  getFontFamily(language: SupportedLanguage): string {
    switch (language) {
      case 'ur':
        return 'Noto Sans Urdu, sans-serif';
      case 'ar':
        return 'Noto Sans Arabic, sans-serif';
      default:
        return 'System';
    }
  }

  /**
   * Apply RTL transformations to flex directions
   */
  getFlexDirection(language: SupportedLanguage, direction: 'row' | 'column' | 'row-reverse' | 'column-reverse'): 'row' | 'column' | 'row-reverse' | 'column-reverse' {
    if (!this.isRTL(language) || direction === 'column' || direction === 'column-reverse') {
      return direction;
    }

    // Reverse row directions for RTL
    if (direction === 'row') {
      return 'row-reverse';
    } else if (direction === 'row-reverse') {
      return 'row';
    }

    return direction;
  }

  /**
   * Get appropriate margin/padding for RTL
   */
  getHorizontalSpacing(language: SupportedLanguage, left: number, right: number): { marginLeft: number; marginRight: number } {
    if (this.isRTL(language)) {
      return {
        marginLeft: right,
        marginRight: left,
      };
    }
    
    return {
      marginLeft: left,
      marginRight: right,
    };
  }

  /**
   * Convert text to appropriate case for language
   */
  formatTitle(text: string, language: SupportedLanguage): string {
    switch (language) {
      case 'en':
        return this.toTitleCase(text);
      case 'ur':
      case 'ar':
        // For RTL languages, preserve original case
        return text;
      default:
        return text;
    }
  }

  /**
   * Convert string to title case
   */
  private toTitleCase(str: string): string {
    return str.replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
    );
  }

  /**
   * Validate if language is supported
   */
  isSupportedLanguage(language: string): language is SupportedLanguage {
    return Object.keys(SUPPORTED_LANGUAGES).includes(language);
  }

  /**
   * Get browser's preferred language from supported languages
   */
  getBrowserLanguage(): SupportedLanguage {
    if (typeof navigator !== 'undefined') {
      const browserLang = navigator.language.split('-')[0];
      if (this.isSupportedLanguage(browserLang)) {
        return browserLang;
      }
    }
    return 'en'; // Default fallback
  }

  /**
   * Get text input direction and alignment for forms
   */
  getInputProps(language: SupportedLanguage) {
    return {
      textAlign: this.getTextAlign(language, 'left'),
      writingDirection: this.getTextDirection(language),
      fontFamily: this.getFontFamily(language),
    };
  }

  /**
   * Format file size with language-appropriate number formatting
   */
  formatFileSize(bytes: number, language: SupportedLanguage): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const size = bytes / Math.pow(1024, i);
    
    return `${this.formatNumber(Math.round(size * 100) / 100, language)} ${sizes[i]}`;
  }

  /**
   * Sort strings according to language collation rules
   */
  sortStrings(strings: string[], language: SupportedLanguage): string[] {
    try {
      return strings.sort((a, b) => 
        a.localeCompare(b, SUPPORTED_LANGUAGES[language].numberFormat)
      );
    } catch (error) {
      return strings.sort();
    }
  }
}

export default new LangUtils();
