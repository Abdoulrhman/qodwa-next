import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

interface LineItem {
  name: string;
  price: number;
  quantity: number;
}

export async function POST(req: Request) {
  try {
    const { items }: { items: LineItem[] } = await req.json();
    const locale =
      req.headers.get('accept-language')?.split(',')[0].split('-')[0] || 'en';

    const session = await stripe.checkout.sessions.create({
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
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
