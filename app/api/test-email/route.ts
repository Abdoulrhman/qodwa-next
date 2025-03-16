import { NextResponse } from 'next/server';
import { sendVerificationEmail } from '@/lib/mail';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    // Send a test verification email
    await sendVerificationEmail(email, 'test-token-123');

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully',
    });
  } catch (error) {
    console.error('Error sending test email:', error);
    return NextResponse.json(
      { error: 'Failed to send test email' },
      { status: 500 }
    );
  }
}
