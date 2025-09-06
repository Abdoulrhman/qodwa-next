'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ArrowLeft, CreditCard, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

// Initialize Stripe
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

// Card form component
function CardForm() {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [cardholderName, setCardholderName] = useState('');
  const [setAsDefault, setSetAsDefault] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      toast.error('Stripe is not loaded');
      return;
    }

    if (!cardholderName.trim()) {
      toast.error('Please enter cardholder name');
      return;
    }

    setLoading(true);

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      toast.error('Card element not found');
      setLoading(false);
      return;
    }

    try {
      // Create payment method
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: cardholderName,
        },
      });

      if (error) {
        toast.error(error.message || 'An error occurred');
        setLoading(false);
        return;
      }

      // Send payment method to your backend
      const response = await fetch('/api/student/payment-methods/stripe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentMethodId: paymentMethod.id,
          setAsDefault,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Payment method added successfully');
        router.push('/dashboard/billing');
      } else {
        toast.error(data.error || 'Failed to add payment method');
      }
    } catch (error) {
      console.error('Error adding payment method:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <div className='container mx-auto py-6 max-w-2xl'>
      <div className='mb-6'>
        <Button variant='ghost' onClick={() => router.back()} className='mb-4'>
          <ArrowLeft className='w-4 h-4 mr-2' />
          Back to Billing
        </Button>
        <h1 className='text-3xl font-bold'>Add Payment Method</h1>
        <p className='text-gray-600 mt-2'>
          Add a new payment method for your subscriptions
        </p>
      </div>

      <div className='grid gap-6'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <CreditCard className='w-5 h-5' />
              Card Information
            </CardTitle>
            <CardDescription>Enter your card details securely</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className='space-y-4'>
              <div>
                <Label htmlFor='cardholderName'>Cardholder Name</Label>
                <input
                  id='cardholderName'
                  type='text'
                  placeholder='John Doe'
                  value={cardholderName}
                  onChange={(e) => setCardholderName(e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  required
                />
              </div>

              <div>
                <Label>Card Details</Label>
                <div className='mt-1 p-3 border border-gray-300 rounded-md'>
                  <CardElement options={cardElementOptions} />
                </div>
              </div>

              <div className='flex items-center space-x-2'>
                <input
                  id='setAsDefault'
                  type='checkbox'
                  checked={setAsDefault}
                  onChange={(e) => setSetAsDefault(e.target.checked)}
                  className='rounded border-gray-300'
                />
                <Label htmlFor='setAsDefault'>
                  Set as default payment method
                </Label>
              </div>

              <Button
                type='submit'
                className='w-full'
                disabled={loading || !stripe}
              >
                {loading ? 'Adding Card...' : 'Add Card'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Shield className='w-5 h-5' />
              Security Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-3 text-sm text-gray-600'>
              <div className='flex items-start gap-3'>
                <Shield className='w-4 h-4 mt-0.5 text-green-600' />
                <div>
                  <p className='font-medium'>
                    Your payment information is secure
                  </p>
                  <p>
                    We use Stripe&apos;s industry-standard encryption to protect
                    your data.
                  </p>
                </div>
              </div>
              <div className='flex items-start gap-3'>
                <Shield className='w-4 h-4 mt-0.5 text-green-600' />
                <div>
                  <p className='font-medium'>PCI DSS Compliant</p>
                  <p>
                    Our payment processing meets the highest security standards.
                  </p>
                </div>
              </div>
              <div className='flex items-start gap-3'>
                <Shield className='w-4 h-4 mt-0.5 text-green-600' />
                <div>
                  <p className='font-medium'>No card details stored</p>
                  <p>
                    We securely tokenize your card information through Stripe.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AddPaymentMethodPage() {
  return (
    <Elements stripe={stripePromise}>
      <CardForm />
    </Elements>
  );
}
