export type Locale = 'en' | 'vi' | 'ja' | 'zh';

export const locales: Locale[] = ['en', 'vi', 'ja', 'zh'];

export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  vi: 'Tiếng Việt',
  ja: '日本語',
  zh: '中文',
};

// Map locales to country codes for Medusa regions
export const localeToCountryCode: Record<Locale, string> = {
  en: 'us',
  vi: 'vn',
  ja: 'jp',
  zh: 'cn',
};

// Map country codes to locales (for backward compatibility)
export const countryCodeToLocale: Record<string, Locale> = {
  us: 'en',
  vn: 'vi',
  jp: 'ja',
  cn: 'zh',
  // Additional mappings
  gb: 'en',
  au: 'en',
  ca: 'en',
};

