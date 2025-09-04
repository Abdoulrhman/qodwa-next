'use client';

import React, { useState } from 'react';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/shared/components/ui/dialog';
import { Plus, X, AlertTriangle } from 'lucide-react';
import { useLocale } from 'next-intl';
import { cn } from '@/lib/utils';
import { stripePromise } from '@/lib/stripe-client';

interface AddPaymentMethodFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  isRTL: boolean;
}

const AddPaymentMethodForm = ({
  onSuccess,
  onCancel,
  isRTL,
}: AddPaymentMethodFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [holderName, setHolderName] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!stripe || !elements) {
      setError('Stripe has not loaded yet. Please try again.');
      return;
    }

    if (!holderName.trim()) {
      setError('Cardholder name is required.');
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError('Card element not found.');
      return;
    }

    setIsLoading(true);

    try {
      // Create payment method with Stripe
      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: holderName,
        },
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      if (!paymentMethod) {
        throw new Error('Failed to create payment method');
      }

      // Save payment method to backend
      const response = await fetch('/api/payment-methods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_method_id: paymentMethod.id,
          set_as_default: false, // Let user choose default separately
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save payment method');
      }

      onSuccess();
    } catch (error) {
      console.error('Error adding payment method:', error);
      setError(error instanceof Error ? error.message : 'Failed to add payment method');
    } finally {
      setIsLoading(false);
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
        ...(isRTL && { textAlign: 'right' as const }),
      },
      invalid: {
        color: '#9e2146',
      },
    },
    hidePostalCode: true, // We'll handle billing address separately if needed
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="holderName" className={cn(isRTL && 'text-right block')}>
          {isRTL ? 'اسم حامل البطاقة' : 'Cardholder Name'}
        </Label>
        <Input
          id="holderName"
          value={holderName}
          onChange={(e) => setHolderName(e.target.value)}
          placeholder={isRTL ? 'أدخل اسم حامل البطاقة' : 'Enter cardholder name'}
          className={cn(isRTL && 'text-right')}
          required
        />
      </div>

      <div className="space-y-2">
        <Label className={cn(isRTL && 'text-right block')}>
          {isRTL ? 'تفاصيل البطاقة' : 'Card Details'}
        </Label>
        <div className="p-3 border rounded-md bg-white">
          <CardElement options={cardElementOptions} />
        </div>
        <p className="text-xs text-muted-foreground">
          {isRTL
            ? 'معلومات بطاقتك آمنة ومشفرة'
            : 'Your card information is secure and encrypted'}
        </p>
      </div>

      <DialogFooter className={cn('gap-2', isRTL && 'flex-row-reverse')}>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          <X className="h-4 w-4 mr-2" />
          {isRTL ? 'إلغاء' : 'Cancel'}
        </Button>
        <Button type="submit" disabled={isLoading || !stripe}>
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              {isRTL ? 'جاري الإضافة...' : 'Adding...'}
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              {isRTL ? 'إضافة البطاقة' : 'Add Card'}
            </>
          )}
        </Button>
      </DialogFooter>
    </form>
  );
};

interface StripeAddPaymentMethodProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  isRTL: boolean;
}

const StripeAddPaymentMethod = ({
  isOpen,
  onClose,
  onSuccess,
  isRTL,
}: StripeAddPaymentMethodProps) => {
  const handleSuccess = () => {
    onSuccess();
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className={cn(isRTL && 'text-right')}>
            {isRTL ? 'إضافة طريقة دفع جديدة' : 'Add New Payment Method'}
          </DialogTitle>
          <DialogDescription className={cn(isRTL && 'text-right')}>
            {isRTL
              ? 'أدخل تفاصيل بطاقتك لحفظها للمدفوعات المستقبلية'
              : 'Enter your card details to save for future payments'}
          </DialogDescription>
        </DialogHeader>

        <Elements stripe={stripePromise}>
          <AddPaymentMethodForm
            onSuccess={handleSuccess}
            onCancel={handleCancel}
            isRTL={isRTL}
          />
        </Elements>
      </DialogContent>
    </Dialog>
  );
};

export default StripeAddPaymentMethod;
