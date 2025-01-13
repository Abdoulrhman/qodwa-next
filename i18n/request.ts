import { getRequestConfig } from 'next-intl/server';
import { routing } from '../i18n/routing';

// Define supported locales
const locales = ['en', 'ar'];

// Preload messages for all locales
const messages = {
  en: require('../messages/en.json'),
  ar: require('../messages/ar.json'),
};

export default getRequestConfig(async ({ requestLocale }) => {
  // Get the locale from the request
  let locale = await requestLocale;

  // Validate that the incoming `locale` parameter is valid
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  // Return the correct messages for the locale
  return {
    messages: messages[locale as keyof typeof messages],
    locale,
  };
});
