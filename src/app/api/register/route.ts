import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { Prisma } from '@prisma/client';
import { generateVerificationToken } from '@/lib/tokens';
import { sendVerificationEmail, sendAdminNewStudentNotification } from '@/lib/mail';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const {
      name,
      email,
      password,
      retypePassword,
      phone,
      gender,
      birthDate,
      referralSource,
    } = await req.json();

    // Validate required fields
    if (!name || !email || !password || !retypePassword) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    if (password !== retypePassword) {
      return NextResponse.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        gender,
        birthDate: birthDate ? new Date(birthDate) : null,
        referralSource,
      },
    });

    // Generate verification token and send verification email
    try {
      const verificationToken = await generateVerificationToken(email);
      await sendVerificationEmail(email, verificationToken.token);
      console.log('✅ Verification email sent to:', email);
    } catch (emailError) {
      console.error('❌ Failed to send verification email:', emailError);
      // Don't fail registration if email fails
    }

    // Send admin notification
    try {
      await sendAdminNewStudentNotification(name, email);
      console.log('✅ Admin notification sent');
    } catch (emailError) {
      console.error('❌ Failed to send admin notification:', emailError);
      // Don't fail registration if email fails
    }

    const { password: _, ...userWithoutPassword } = user;
    
    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
     
      if (error.code === 'P2002') {
        const target = error.meta?.target as string[] | undefined;
        const field = target?.[0] || 'field';
        return NextResponse.json(
          { error: `A user with this ${field} already exists` },
          { status: 409 }
        );
      }
    }
    
    // Handle validation errors
    if (error instanceof Prisma.PrismaClientValidationError) {
      return NextResponse.json(
        { error: 'Invalid data provided' },
        { status: 400 }
      );
    }
    
   
    return NextResponse.json(
      { error: 'An unexpected error occurred during registration' },
      { status: 500 }
    );
  }
}
