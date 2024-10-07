import {createSharedPathnamesNavigation} from 'next-intl/navigation';

export const routing = {
  locales: ['en', 'ar'],
  defaultLocale: 'en',
};

export const {Link, redirect, usePathname, useRouter} =
  createSharedPathnamesNavigation(routing);
