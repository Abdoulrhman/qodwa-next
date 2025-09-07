import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { payment_method_id } = await req.json();

    if (!payment_method_id) {
      return NextResponse.json(
        { error: 'Payment method ID is required' },
        { status: 400 }
      );
    }

    // First, remove default flag from all user's payment methods
    await db.paymentMethod.updateMany({
      where: { 
        userId: session.user.id,
        isActive: true 
      },
      data: { isDefault: false },
    });

    // Then set the selected payment method as default
    await db.paymentMethod.update({
      where: { 
        stripePaymentMethodId: payment_method_id,
        userId: session.user.id,
      },
      data: { isDefault: true },
    });

    // Also update user's defaultPaymentMethodId
    await db.user.update({
      where: { id: session.user.id },
      data: { defaultPaymentMethodId: payment_method_id },
    });

    return NextResponse.json({
      success: true,
      message: 'Default payment method updated successfully',
    });
  } catch (error) {
    console.error('[SET_DEFAULT_PAYMENT_METHOD]', error);
    return NextResponse.json(
      { error: 'Failed to set default payment method' },
      { status: 500 }
    );
  }
}
