import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import stripe from '@/lib/stripe-client';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's payment methods
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: {
        paymentMethods: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const paymentMethods = user.paymentMethods.map((method) => ({
      id: method.id,
      type: method.type,
      last4: method.last4,
      brand: method.brand,
      expiryMonth: method.expiryMonth,
      expiryYear: method.expiryYear,
      isDefault: method.id === user.defaultPaymentMethodId,
      isActive: method.isActive,
    }));

    return NextResponse.json({ paymentMethods });
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { cardNumber, expiryMonth, expiryYear, cvc, name, setAsDefault } =
      await request.json();

    // Validate input
    if (!cardNumber || !expiryMonth || !expiryYear || !cvc || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get or create Stripe customer
    const user = await db.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let customerId = user.stripeCustomerId;

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email!,
        name: user.name || undefined,
        metadata: {
          userId: user.id,
        },
      });

      customerId = customer.id;

      // Update user with Stripe customer ID
      await db.user.update({
        where: { id: session.user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    // Create payment method in Stripe
    const paymentMethod = await stripe.paymentMethods.create({
      type: 'card',
      card: {
        number: cardNumber.replace(/\s/g, ''),
        exp_month: parseInt(expiryMonth),
        exp_year: parseInt(`20${expiryYear}`),
        cvc: cvc,
      },
      billing_details: {
        name: name,
        email: user.email || undefined,
      },
    });

    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethod.id, {
      customer: customerId,
    });

    // Store payment method in database
    const dbPaymentMethod = await db.paymentMethod.create({
      data: {
        userId: session.user.id,
        stripePaymentMethodId: paymentMethod.id,
        type: 'card',
        last4: paymentMethod.card!.last4,
        brand: paymentMethod.card!.brand,
        expiryMonth: paymentMethod.card!.exp_month,
        expiryYear: paymentMethod.card!.exp_year,
        isActive: true,
      },
    });

    // Set as default if requested or if it's the first payment method
    if (setAsDefault || !user.defaultPaymentMethodId) {
      await db.user.update({
        where: { id: session.user.id },
        data: { defaultPaymentMethodId: dbPaymentMethod.id },
      });

      // Set as default in Stripe
      await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethod.id,
        },
      });
    }

    return NextResponse.json({
      success: true,
      paymentMethod: {
        id: dbPaymentMethod.id,
        type: dbPaymentMethod.type,
        last4: dbPaymentMethod.last4,
        brand: dbPaymentMethod.brand,
        expiryMonth: dbPaymentMethod.expiryMonth,
        expiryYear: dbPaymentMethod.expiryYear,
      },
    });
  } catch (error) {
    console.error('Error adding payment method:', error);

    if (error instanceof Error) {
      // Handle specific Stripe errors
      if (error.message.includes('card_number_invalid')) {
        return NextResponse.json(
          { error: 'Invalid card number' },
          { status: 400 }
        );
      }
      if (error.message.includes('card_cvc_invalid')) {
        return NextResponse.json(
          { error: 'Invalid CVC code' },
          { status: 400 }
        );
      }
      if (error.message.includes('card_expiry_invalid')) {
        return NextResponse.json(
          { error: 'Invalid expiry date' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to add payment method' },
      { status: 500 }
    );
  }
}
