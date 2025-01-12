import { notFound } from 'next/navigation';
import { getRequestConfig, setRequestLocale } from 'next-intl/server';

// Define supported locales
const locales = ['en', 'ar'];

// Preload messages for all locales
const messages = {
  en: require('../messages/en.json'),
  ar: require('../messages/ar.json'),
};

export default getRequestConfig(({ locale }) => {
  // Set the request locale for static rendering
  setRequestLocale(locale);

  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as string)) {
    notFound(); // Trigger a 404 if the locale is not supported
  }

  // Return the correct messages for the locale
  return {
    messages: messages[locale as keyof typeof messages],
  };
});
