import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@/lib/auth';
import { sendAdminNotification } from '@/lib/admin-notifications';
import { Resend } from 'resend';

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();

    // Check if user is admin
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { action } = await request.json();

    if (action === 'test_resend_direct') {
      // Test Resend directly
      const resend = new Resend(process.env.RESEND_API_KEY);

      try {
        const result = await resend.emails.send({
          from: `Qodwa Platform <${process.env.RESEND_FROM_EMAIL}>`,
          to: [
            process.env.ADMIN_NOTIFICATION_EMAIL ||
              'abdoulrhman_salah@hotmail.com',
          ],
          subject: 'Test Email from Qodwa Platform',
          html: `
            <h1>Test Email</h1>
            <p>This is a test email to verify Resend configuration.</p>
            <p>Time: ${new Date().toISOString()}</p>
            <p>From: ${process.env.RESEND_FROM_EMAIL}</p>
            <p>To: ${process.env.ADMIN_NOTIFICATION_EMAIL}</p>
          `,
        });

        return NextResponse.json({
          success: true,
          message: 'Direct Resend test sent',
          result: result,
          config: {
            apiKey: process.env.RESEND_API_KEY ? 'Set (hidden)' : 'Not set',
            fromEmail: process.env.RESEND_FROM_EMAIL || 'Not set',
            adminEmail: process.env.ADMIN_NOTIFICATION_EMAIL || 'Not set',
          },
        });
      } catch (error) {
        return NextResponse.json({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          config: {
            apiKey: process.env.RESEND_API_KEY ? 'Set (hidden)' : 'Not set',
            fromEmail: process.env.RESEND_FROM_EMAIL || 'Not set',
            adminEmail: process.env.ADMIN_NOTIFICATION_EMAIL || 'Not set',
          },
        });
      }
    }

    if (action === 'test_admin_notification') {
      // Test the admin notification function
      const result = await sendAdminNotification({
        type: 'USER_REGISTRATION',
        user: {
          id: 'debug-test-id',
          name: 'Debug Test User',
          email: 'debug-test@example.com',
          role: 'USER',
          isTeacher: false,
          phone: '+1234567890',
          gender: 'MALE',
        },
      });

      return NextResponse.json({
        success: result.success,
        message: 'Admin notification test completed',
        result: result,
        config: {
          apiKey: process.env.RESEND_API_KEY ? 'Set (hidden)' : 'Not set',
          fromEmail: process.env.RESEND_FROM_EMAIL || 'Not set',
          adminEmail: process.env.ADMIN_NOTIFICATION_EMAIL || 'Not set',
        },
      });
    }

    if (action === 'check_config') {
      // Just check configuration
      return NextResponse.json({
        success: true,
        message: 'Configuration check',
        config: {
          apiKey: process.env.RESEND_API_KEY ? 'Set (hidden)' : 'Not set',
          apiKeyLength: process.env.RESEND_API_KEY
            ? process.env.RESEND_API_KEY.length
            : 0,
          fromEmail: process.env.RESEND_FROM_EMAIL || 'Not set',
          adminEmail: process.env.ADMIN_NOTIFICATION_EMAIL || 'Not set',
          baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'Not set',
        },
      });
    }

    return NextResponse.json({
      success: false,
      error:
        'Invalid action. Use: test_resend_direct, test_admin_notification, or check_config',
    });
  } catch (error) {
    console.error('Error in debug endpoint:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();

    // Check if user is admin
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    // Return debug information
    return NextResponse.json({
      success: true,
      message: 'Debug information',
      environment: {
        nodeEnv: process.env.NODE_ENV,
        resendApiKey: process.env.RESEND_API_KEY ? 'Set' : 'Not set',
        resendFromEmail: process.env.RESEND_FROM_EMAIL || 'Not set',
        adminEmail: process.env.ADMIN_NOTIFICATION_EMAIL || 'Not set',
        baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'Not set',
      },
      instructions: {
        'POST /api/debug/email': {
          test_resend_direct: 'Test Resend API directly',
          test_admin_notification: 'Test admin notification function',
          check_config: 'Check environment configuration',
        },
      },
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
