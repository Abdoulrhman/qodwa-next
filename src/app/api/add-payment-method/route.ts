import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      cardNumber,
      expiryMonth,
      expiryYear,
      cvc,
      holderName,
      brand
    } = await req.json();

    // Basic validation
    if (!cardNumber || !expiryMonth || !expiryYear || !cvc || !holderName) {
      return NextResponse.json(
        { error: 'All card details are required' },
        { status: 400 }
      );
    }

    // Create mock payment method ID
    const mockPaymentMethodId = `pm_mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Detect card brand
    const detectedBrand = detectCardBrand(cardNumber);
    
    // Check if this is the user's first payment method
    const existingMethods = await db.paymentMethod.findMany({
      where: { userId: session.user.id, isActive: true }
    });
    
    const isFirstMethod = existingMethods.length === 0;

    // Create payment method record
    const paymentMethod = await db.paymentMethod.create({
      data: {
        userId: session.user.id,
        stripePaymentMethodId: mockPaymentMethodId,
        type: 'card',
        last4: cardNumber.replace(/\s/g, '').slice(-4),
        brand: brand || detectedBrand,
        expiryMonth: parseInt(expiryMonth),
        expiryYear: parseInt(expiryYear),
        isDefault: isFirstMethod,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Payment method added successfully',
      paymentMethod: {
        id: paymentMethod.id,
        stripePaymentMethodId: paymentMethod.stripePaymentMethodId,
        type: paymentMethod.type,
        last4: paymentMethod.last4,
        brand: paymentMethod.brand,
        expiryMonth: paymentMethod.expiryMonth,
        expiryYear: paymentMethod.expiryYear,
        isDefault: paymentMethod.isDefault,
        isActive: paymentMethod.isActive,
      },
    });
  } catch (error) {
    console.error('[ADD_PAYMENT_METHOD]', error);
    return NextResponse.json(
      { error: 'Failed to add payment method' },
      { status: 500 }
    );
  }
}

function detectCardBrand(cardNumber: string): string {
  const number = cardNumber.replace(/\s/g, '');
  if (number.startsWith('4')) return 'visa';
  if (number.startsWith('5') || number.startsWith('2')) return 'mastercard';
  if (number.startsWith('3')) return 'amex';
  if (number.startsWith('6')) return 'discover';
  return 'visa'; // default
}
