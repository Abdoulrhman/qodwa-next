import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { auth } from '@/auth';

interface LineItem {
  name: string;
  price: number;
  quantity: number;
  packageId: number;
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { items }: { items: LineItem[] } = await req.json();
    const locale =
      req.headers.get('accept-language')?.split(',')[0].split('-')[0] || 'en';

    // Get the first item's packageId (assuming one package per checkout)
    const packageId = items[0]?.packageId;
    if (!packageId) {
      return NextResponse.json(
        { error: 'Package ID is required' },
        { status: 400 }
      );
    }

    console.log('Stripe Secret Key:', process.env.STRIPE_SECRET_KEY);

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items.map((item) => ({
        price_data: {
          currency: 'usd',
          product_data: { name: item.name },
          unit_amount: item.price * 100,
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/${locale}/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/${locale}/cancel`,
      metadata: {
        userId: session.user.id,
        packageId: packageId.toString(),
      },
    });

    return NextResponse.json({ sessionId: checkoutSession.id });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
