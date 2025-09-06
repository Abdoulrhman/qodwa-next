'use client';

import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { ReactNode } from 'react';

// Load Stripe outside of component to avoid recreating the Stripe object on every render
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string
);

interface StripeElementsProviderProps {
  children: ReactNode;
}

export default function StripeElementsProvider({
  children,
}: StripeElementsProviderProps) {
  return <Elements stripe={stripePromise}>{children}</Elements>;
}
