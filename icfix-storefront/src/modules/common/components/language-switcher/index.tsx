'use client';

import {useLocale} from 'next-intl';
import {useRouter, usePathname} from 'next/navigation';
import {locales, localeNames, type Locale} from '@/i18n/config';
import { clx } from '@medusajs/ui';
import { useState, useTransition } from 'react';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  const handleLocaleChange = (newLocale: Locale) => {
    if (newLocale === locale) {
      setIsOpen(false);
      return;
    }

    // Replace the current locale in the pathname with the new one
    const segments = pathname.split('/');
    segments[1] = newLocale;
    const newPathname = segments.join('/');
    
    startTransition(() => {
      router.replace(newPathname);
      setIsOpen(false);
    });
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={clx(
          "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md",
          "hover:bg-neutral-100 transition-colors",
          "border border-neutral-200",
          isPending && "opacity-50 cursor-wait"
        )}
        disabled={isPending}
      >
        <svg 
          className="w-4 h-4" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" 
          />
        </svg>
        <span className="hidden sm:inline">{localeNames[locale as Locale]}</span>
        <span className="inline sm:hidden">{locale.toUpperCase()}</span>
        <svg 
          className={clx(
            "w-4 h-4 transition-transform",
            isOpen && "rotate-180"
          )} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M19 9l-7 7-7-7" 
          />
        </svg>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 z-20 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="py-1" role="menu">
              {locales.map((loc) => (
                <button
                  key={loc}
                  onClick={() => handleLocaleChange(loc)}
                  className={clx(
                    "block w-full text-left px-4 py-2 text-sm transition-colors",
                    locale === loc 
                      ? "bg-neutral-100 text-neutral-900 font-medium" 
                      : "text-neutral-700 hover:bg-neutral-50"
                  )}
                  role="menuitem"
                >
                  <div className="flex items-center justify-between">
                    <span>{localeNames[loc]}</span>
                    {locale === loc && (
                      <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

