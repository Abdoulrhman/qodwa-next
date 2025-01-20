'use client';

import { loadStripe, Stripe } from '@stripe/stripe-js';
import { MouseEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const stripePromise: Promise<Stripe | null> = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string
);

interface CheckoutButtonProps {
  items: { name: string; price: number; quantity: number }[];
  className?: string;
}

export default function CheckoutButton({ items, className }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setLoading(true);

    const stripe = await stripePromise;

    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    });

    const { sessionId } = await response.json(); // Get the sessionId

    if (stripe && sessionId) {
      // Redirect to Stripe Checkout with the sessionId
      const result = await stripe.redirectToCheckout({ sessionId });

      if (result.error) {
        console.error(result.error.message);
      }
    }

    setLoading(false);
  };

  return (
    <Button
      onClick={handleCheckout}
      disabled={loading}
      className={cn(
        "flex items-center justify-center gap-2",
        className
      )}
    >
      {loading ? (
        <span>Processing...</span>
      ) : (
        <span>Enroll Now</span>
      )}
    </Button>
  );
}
