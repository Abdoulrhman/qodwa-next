import { NextRequest, NextResponse } from 'next/server';
import {
  getSubscriptionsDueForRenewal,
  processSubscriptionRenewal,
} from '@/lib/stripe-subscription';
import { db } from '@/lib/db';

/**
 * Railway Function for processing subscription renewals
 * This function should be called daily via Railway's cron job feature
 */
export async function POST(req: NextRequest) {
  try {
    // Verify the request is from Railway or has the correct secret
    const authHeader = req.headers.get('authorization');
    const expectedToken = process.env.RAILWAY_FUNCTION_SECRET;

    if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Starting subscription renewal process...');

    // Get subscriptions that are due for renewal
    const dueSubscriptions = await getSubscriptionsDueForRenewal();

    console.log(
      `Found ${dueSubscriptions.length} subscriptions due for renewal`
    );

    const results = {
      processed: 0,
      successful: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Process each subscription
    for (const subscription of dueSubscriptions) {
      try {
        results.processed++;

        console.log(
          `Processing subscription ${subscription.id} for user ${subscription.userId}`
        );

        const result = await processSubscriptionRenewal(subscription.id);

        if (result.success) {
          results.successful++;
          console.log(`Successfully renewed subscription ${subscription.id}`);
        } else {
          results.failed++;
          results.errors.push(
            `Subscription ${subscription.id}: ${result.error}`
          );
          console.error(
            `Failed to renew subscription ${subscription.id}: ${result.error}`
          );
        }
      } catch (error) {
        results.failed++;
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        results.errors.push(`Subscription ${subscription.id}: ${errorMessage}`);
        console.error(
          `Error processing subscription ${subscription.id}:`,
          error
        );
      }
    }

    // Log summary
    console.log('Subscription renewal process completed:', results);

    // Send email notifications for failed renewals (implement this separately)
    if (results.failed > 0) {
      await notifyAdminsOfFailedRenewals(results);
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription renewal process completed',
      results,
    });
  } catch (error) {
    console.error('Error in subscription renewal function:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for health check and status
 */
export async function GET(req: NextRequest) {
  try {
    // Simple health check
    const upcomingRenewals = await db.subscription.count({
      where: {
        auto_renew: true,
        status: 'ACTIVE',
        next_billing_date: {
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next 7 days
        },
      },
    });

    const failedAttempts = await db.subscription.count({
      where: {
        auto_renew: true,
        auto_renew_attempts: {
          gte: 1,
        },
      },
    });

    return NextResponse.json({
      status: 'healthy',
      upcoming_renewals: upcomingRenewals,
      failed_attempts: failedAttempts,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Notify admins of failed renewals
 */
async function notifyAdminsOfFailedRenewals(results: any) {
  try {
    // Get admin users
    const admins = await db.user.findMany({
      where: { role: 'ADMIN' },
      select: { email: true, name: true },
    });

    // Here you would implement email notifications
    // For now, just log the notification
    console.log('Failed renewal notification needed for:', {
      failed_count: results.failed,
      errors: results.errors,
      admins: admins.map((admin) => admin.email),
    });

    // You can integrate with your existing email system here
    // Example: await sendEmail({ ... });
  } catch (error) {
    console.error('Error notifying admins of failed renewals:', error);
  }
}
