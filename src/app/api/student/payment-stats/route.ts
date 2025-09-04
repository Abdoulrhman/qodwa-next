import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Get real payment statistics from database
    const [subscriptions, allSubscriptions] = await Promise.all([
      // Get active subscriptions
      db.subscription.findMany({
        where: {
          userId: userId,
          status: 'ACTIVE',
        },
        include: {
          package: true,
        },
      }),
      
      // Get all subscriptions for total spent calculation
      db.subscription.findMany({
        where: {
          userId: userId,
        },
        include: {
          package: true,
        },
      }),
    ]);

    // Calculate statistics
    const activeSubscriptions = subscriptions.length;

    // Calculate total spent from all subscriptions (past and present)
    const totalSpent = allSubscriptions.reduce((total: number, subscription: any) => {
      return total + Number(subscription.package.price || 0);
    }, 0);

    // Find next payment date and amount from active subscriptions with auto-renewal
    let nextPaymentDate: string | undefined;
    let nextPaymentAmount: number | undefined;

    const activeAutoRenewSubscriptions = subscriptions.filter(
      (sub: any) => sub.auto_renew === true
    );

    if (activeAutoRenewSubscriptions.length > 0) {
      // Find the earliest next billing date
      const upcomingPayments = activeAutoRenewSubscriptions
        .filter((sub: any) => sub.next_billing_date)
        .map((sub: any) => ({
          date: sub.next_billing_date!,
          amount: Number(sub.package.price || 0),
        }))
        .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

      if (upcomingPayments.length > 0) {
        nextPaymentDate = upcomingPayments[0].date.toISOString();
        nextPaymentAmount = upcomingPayments[0].amount;
      }
    }

    const stats = {
      totalSpent,
      activeSubscriptions,
      nextPaymentDate,
      nextPaymentAmount,
    };

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('Error fetching payment stats:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
