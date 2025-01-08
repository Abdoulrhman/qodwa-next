'use client';

import { loadStripe, Stripe } from '@stripe/stripe-js';
import { MouseEvent } from 'react';

const stripePromise: Promise<Stripe | null> = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string
);

interface CheckoutButtonProps {
  items: { name: string; price: number; quantity: number }[];
}

export default function CheckoutButton({ items }: CheckoutButtonProps) {
  const handleCheckout = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

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
  };

  return (
    <button onClick={handleCheckout} className='package-card__enroll-button'>
      Checkout
    </button>
  );
}
