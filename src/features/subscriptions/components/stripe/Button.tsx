'use client';

import { loadStripe, Stripe } from '@stripe/stripe-js';
import { MouseEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';

// Add error handling for missing Stripe key
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
console.log(
  'Stripe publishable key:',
  stripePublishableKey ? 'Found' : 'Missing'
);

const stripePromise: Promise<Stripe | null> = stripePublishableKey
  ? loadStripe(stripePublishableKey)
  : Promise.resolve(null);

interface CheckoutButtonProps {
  items: { name: string; price: number; quantity: number; packageId: number }[];
  className?: string;
}

export default function CheckoutButton({
  items,
  className,
}: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const t = useTranslations('PackageDetails');
  const { status } = useSession();
  const router = useRouter();
  const locale = useLocale();

  const handleCheckout = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (status !== 'authenticated') {
      router.push(`/${locale}/auth/login`);
      return;
    }

    setLoading(true);

    try {
      // Check if Stripe was loaded successfully
      const stripe = await stripePromise;

      if (!stripe) {
        console.error('Stripe failed to load. Check your publishable key.');
        alert('Payment system is not available. Please try again later.');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Checkout API error:', errorData);
        alert('Failed to create payment session. Please try again.');
        setLoading(false);
        return;
      }

      const { sessionId } = await response.json();

      if (!sessionId) {
        console.error('No session ID returned from checkout API');
        alert('Payment session could not be created. Please try again.');
        setLoading(false);
        return;
      }

      const result = await stripe.redirectToCheckout({ sessionId });

      if (result.error) {
        console.error('Stripe redirect error:', result.error.message);
        alert(`Payment error: ${result.error.message}`);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleCheckout}
      disabled={loading}
      className={cn('flex items-center justify-center gap-2', className)}
    >
      {loading ? (
        <span>{t('loading')}</span>
      ) : (
        <span>{t('buttons.enroll_now')}</span>
      )}
    </Button>
  );
}
