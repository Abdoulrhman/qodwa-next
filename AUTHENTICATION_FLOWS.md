# Qodwa Platform Authentication Flows Documentation

## Overview

The Qodwa platform uses NextAuth.js v5 for authentication with support for multiple providers, two-factor authentication, email verification, and internationalization (Arabic/English).

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Registration Flow](#registration-flow)
3. [Login Flow](#login-flow)
4. [Authentication Components](#authentication-components)
5. [Security Features](#security-features)
6. [Routes and Middleware](#routes-and-middleware)
7. [Database Schema](#database-schema)
8. [Error Handling](#error-handling)

## Architecture Overview

### Key Technologies

- **NextAuth.js v5**: Authentication framework
- **Prisma**: Database ORM
- **React Hook Form**: Form validation and management
- **Zod**: Schema validation
- **bcryptjs**: Password hashing
- **Next-intl**: Internationalization

### Authentication Providers

- **Credentials**: Email/password authentication
- **Google OAuth**: Social authentication
- **Two-Factor Authentication**: TOTP support

### File Structure

```
components/auth/
├── card-wrapper.tsx          # Common wrapper for auth forms
├── login-form.tsx            # Login form component
├── register-form.tsx         # Registration form component
├── nav-header.tsx           # Navigation header with logo
├── social.tsx               # Social login buttons
├── header.tsx               # Simple header component
└── back-button.tsx          # Navigation back button

actions/
├── login.ts                 # Server action for login
├── register.ts              # Server action for registration
├── logout.ts                # Server action for logout
├── new-verification.ts      # Email verification
├── reset.ts                 # Password reset
└── new-password.ts          # New password setting

schemas/
└── index.ts                 # Zod validation schemas

data/
├── user.ts                  # User data access functions
├── verification-token.ts    # Email verification tokens
├── two-factor-token.ts      # 2FA tokens
└── two-factor-confirmation.ts # 2FA confirmations
```

## Registration Flow

### 1. User Interface (`components/auth/register-form.tsx`)

#### Form Fields

- **Name**: Required, 2-50 characters
- **Email**: Required, valid email format
- **Password**: Required, minimum 8 characters
- **Retype Password**: Required, must match password
- **Phone**: Optional
- **Gender**: Required, enum (MALE/FEMALE)
- **Birth Date**: Optional, date format
- **Referral Source**: Optional, dropdown (Facebook, Google, Friend, Others)
- **isTeacher**: Hidden field, defaults to false

#### Validation Schema (`StudentFormSchema`)

```typescript
export const StudentFormSchema = z
  .object({
    name: z.string().min(2).max(50),
    email: z.string().email(),
    password: z.string().min(8),
    retypePassword: z.string().nonempty(),
    phone: z.string().optional(),
    gender: z.enum(['MALE', 'FEMALE']),
    birthDate: z.string().optional(),
    referralSource: z.string().optional(),
    isTeacher: z.boolean().optional(),
  })
  .superRefine(({ password, retypePassword }, ctx) => {
    if (password !== retypePassword) {
      ctx.addIssue({
        code: 'custom',
        message: 'Passwords do not match',
        path: ['retypePassword'],
      });
    }
  });
```

### 2. Server Action (`actions/register.ts`)

#### Process Flow

1. **Validation**: Validate input using `StudentFormSchema`
2. **Duplicate Check**: Check if email already exists
3. **Password Hashing**: Hash password using bcryptjs (cost: 10)
4. **User Creation**: Create user record in database
5. **Email Verification**: Generate and send verification token

#### Code Implementation

```typescript
export const register = async (values: z.infer<typeof StudentFormSchema>) => {
  // 1. Validate fields
  const validatedFields = StudentFormSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: 'Invalid fields!' };
  }

  // 2. Extract data
  const {
    email,
    password,
    name,
    phone,
    gender,
    birthDate,
    referralSource,
    isTeacher,
  } = validatedFields.data;

  // 3. Check existing user
  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    return { error: 'Email already in use!' };
  }

  // 4. Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // 5. Create user
  await db.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      phone,
      gender,
      birthDate: birthDate ? new Date(birthDate) : null,
      referralSource,
      isTeacher,
    },
  });

  // 6. Send verification email
  const verificationToken = await generateVerificationToken(email);
  await sendVerificationEmail(verificationToken.email, verificationToken.token);

  return { success: 'Confirmation email sent!' };
};
```

### 3. Registration States

- **Success**: User created, verification email sent
- **Error**: Email already exists, validation errors
- **Loading**: Form disabled during submission

## Login Flow

### 1. User Interface (`components/auth/login-form.tsx`)

#### Form Fields

- **Email**: Required for initial login
- **Password**: Required for initial login
- **Two-Factor Code**: Appears after successful credential validation (if 2FA enabled)

#### Dynamic Form Behavior

```typescript
const [showTwoFactor, setShowTwoFactor] = useState(false);

// Form shows different fields based on 2FA state
{
  showTwoFactor ? (
    // Two-factor code input
    <FormField name='code' />
  ) : (
    // Email and password inputs
    <>
      <FormField name='email' />
      <FormField name='password' />
    </>
  );
}
```

### 2. Server Action (`actions/login.ts`)

#### Process Flow

1. **Field Validation**: Validate using `LoginSchema`
2. **User Lookup**: Find user by email
3. **Account Verification**: Check if email is verified
4. **Two-Factor Authentication**: Handle 2FA if enabled
5. **Credential Authentication**: Sign in using NextAuth
6. **Redirect**: Navigate to callback URL or default dashboard

#### Detailed Implementation

```typescript
export const login = async (
  values: z.infer<typeof LoginSchema>,
  callbackUrl?: string | null,
  locale: string = 'en'
) => {
  // 1. Validate input
  const validatedFields = LoginSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: 'Invalid fields!' };
  }

  const { email, password, code } = validatedFields.data;

  // 2. Find user
  const existingUser = await getUserByEmail(email);
  if (!existingUser || !existingUser.email || !existingUser.password) {
    return { error: 'Email does not exist!' };
  }

  // 3. Check email verification
  if (!existingUser.emailVerified) {
    const verificationToken = await generateVerificationToken(
      existingUser.email
    );
    await sendVerificationEmail(
      verificationToken.email,
      verificationToken.token
    );
    return { success: 'Confirmation email sent!' };
  }

  // 4. Handle Two-Factor Authentication
  if (existingUser.isTwoFactorEnabled && existingUser.email) {
    if (code) {
      // Verify 2FA code
      const twoFactorToken = await getTwoFactorTokenByEmail(existingUser.email);

      if (!twoFactorToken || twoFactorToken.token !== code) {
        return { error: 'Invalid code!' };
      }

      const hasExpired = new Date(twoFactorToken.expires) < new Date();
      if (hasExpired) {
        return { error: 'Code expired!' };
      }

      // Clean up tokens and create confirmation
      await db.twoFactorToken.delete({ where: { id: twoFactorToken.id } });

      const existingConfirmation = await getTwoFactorConfirmationByUserId(
        existingUser.id
      );
      if (existingConfirmation) {
        await db.twoFactorConfirmation.delete({
          where: { id: existingConfirmation.id },
        });
      }

      await db.twoFactorConfirmation.create({
        data: { userId: existingUser.id },
      });
    } else {
      // Send 2FA code
      const twoFactorToken = await generateTwoFactorToken(existingUser.email);
      await sendTwoFactorTokenEmail(twoFactorToken.email, twoFactorToken.token);
      return { twoFactor: true };
    }
  }

  // 5. Authenticate with NextAuth
  try {
    await signIn('credentials', {
      email,
      password,
      redirectTo: callbackUrl || getDefaultLoginRedirect(locale),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { error: 'Invalid credentials!' };
        default:
          return { error: 'Something went wrong!' };
      }
    }
    throw error;
  }
};
```

### 3. Login States

- **Initial**: Email/password form
- **Two-Factor**: Code input form (if 2FA enabled)
- **Success**: Redirect to dashboard or callback URL
- **Error**: Invalid credentials, expired codes, verification required

## Authentication Components

### CardWrapper (`components/auth/card-wrapper.tsx`)

Central wrapper component for all authentication forms.

#### Features

- **Flexible Headers**: Supports both simple headers and navigation headers with logos
- **Social Authentication**: Optional social login buttons
- **Navigation**: Back button for form switching
- **Responsive Design**: Consistent styling across forms

#### Props Interface

```typescript
interface CardWrapperProps {
  children: React.ReactNode;
  headerLabel: string;
  backButtonLabel: string;
  backButtonHref: string;
  showSocial?: boolean;
  useAuthHeader?: boolean;
  authHeaderProps?: {
    logoSrc?: string;
    logoAlt?: string;
    logoWidth?: number;
    logoHeight?: number;
    title?: string;
    variant?: 'full' | 'logo-only';
    subtitle?: string;
  };
}
```

### NavigationHeader (`components/auth/nav-header.tsx`)

Enhanced header component with logo and branding.

#### Variants

- **Full**: Complete header with logo and title
- **Logo-only**: Simplified header with logo and subtitle

### Social Authentication (`components/auth/social.tsx`)

Handles OAuth providers (Google) integration.

## Security Features

### Password Security

- **Hashing**: bcryptjs with cost factor 10
- **Validation**: Minimum 8 characters required
- **Confirmation**: Password retyping required

### Email Verification

- **Token Generation**: Cryptographically secure tokens
- **Expiration**: Time-limited verification links
- **Required**: Users must verify email before login

### Two-Factor Authentication

- **TOTP Support**: Time-based one-time passwords
- **Email Delivery**: 2FA codes sent via email
- **Session Management**: Separate confirmation tracking

### Input Validation

- **Client-side**: React Hook Form with Zod schemas
- **Server-side**: Re-validation in server actions
- **Sanitization**: Automatic data cleaning

## Routes and Middleware

### Route Configuration (`routes.ts`)

#### Public Routes

```typescript
export const publicRoutes = locales.flatMap((locale) => [
  `/${locale}/`,
  `/${locale}/auth/new-verification`,
]);
```

#### Authentication Routes

```typescript
export const authRoutes = locales.flatMap((locale) => [
  `/${locale}/auth/login`,
  `/${locale}/auth/register`,
  `/${locale}/auth/error`,
  `/${locale}/auth/reset`,
  `/${locale}/auth/new-password`,
]);
```

#### Protected Routes

```typescript
export const protectedRoutes = locales.flatMap((locale) => [
  `/${locale}/dashboard`,
  `/${locale}/dashboard/profile`,
  `/${locale}/dashboard/learning-paths`,
  `/${locale}/dashboard/lesson-reports`,
  `/${locale}/dashboard/payments`,
  `/${locale}/dashboard/schedule`,
]);
```

### Middleware Protection

The application uses NextAuth.js middleware to:

- Protect authenticated routes
- Redirect unauthenticated users to login
- Handle locale-based routing
- Manage session state

## Database Schema

### User Model

```prisma
model User {
  id                    String    @id @default(cuid())
  name                  String?
  email                 String    @unique
  emailVerified         DateTime?
  password              String?
  phone                 String?
  gender                Gender?
  birthDate             DateTime?
  referralSource        String?
  isTeacher             Boolean   @default(false)
  role                  UserRole  @default(USER)
  isTwoFactorEnabled    Boolean   @default(false)

  // Relationships
  accounts              Account[]
  twoFactorConfirmation TwoFactorConfirmation?

  @@map("users")
}
```

### Supporting Models

- **Account**: OAuth account linking
- **VerificationToken**: Email verification
- **PasswordResetToken**: Password reset
- **TwoFactorToken**: 2FA codes
- **TwoFactorConfirmation**: 2FA session tracking

## Error Handling

### Client-Side Errors

- **Form Validation**: Real-time field validation
- **Network Errors**: Graceful handling of API failures
- **User Feedback**: Clear error and success messages

### Server-Side Errors

- **Input Validation**: Schema validation with detailed messages
- **Database Errors**: Proper error catching and logging
- **Authentication Errors**: Specific error types for different scenarios

### Common Error Scenarios

#### Registration Errors

- Invalid email format
- Password too short
- Passwords don't match
- Email already registered
- Database connection issues

#### Login Errors

- Email doesn't exist
- Invalid credentials
- Email not verified
- Two-factor code invalid/expired
- Account locked/disabled

## Best Practices

### Security

1. **Never store plain text passwords**
2. **Always validate input on both client and server**
3. **Use HTTPS in production**
4. **Implement rate limiting**
5. **Regular security audits**

### User Experience

1. **Clear error messages**
2. **Progressive disclosure (2FA)**
3. **Responsive design**
4. **Internationalization support**
5. **Accessibility compliance**

### Development

1. **Type safety with TypeScript**
2. **Schema-driven validation**
3. **Separation of concerns**
4. **Comprehensive error handling**
5. **Consistent component architecture**

## Troubleshooting

### Common Issues

#### "Email already in use"

- User attempting to register with existing email
- Check user database for duplicate entries

#### "Invalid credentials"

- Wrong email/password combination
- Account may not exist or password may be incorrect

#### "Email not verified"

- User hasn't clicked verification link
- Resend verification email

#### "Invalid code" (2FA)

- Wrong 2FA code entered
- Code may have expired (check token expiration)

#### Logo not displaying

- Check image path and file existence
- Verify Next.js Image component props
- Check browser console for loading errors

### Debug Mode

Add console logging to components for debugging:

```typescript
console.log('CardWrapper props:', { useAuthHeader, authHeaderProps });
```

### Environment Variables

Ensure these are properly configured:

- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- Database connection strings
- Email service credentials

## Future Enhancements

### Planned Features

1. **Social Providers**: Facebook, Twitter, LinkedIn
2. **SMS 2FA**: Phone-based verification
3. **Biometric Authentication**: WebAuthn support
4. **Session Management**: Advanced session controls
5. **Audit Logging**: Comprehensive security logs

### Performance Optimizations

1. **Caching**: Session and user data caching
2. **Rate Limiting**: Advanced rate limiting strategies
3. **Database Indexing**: Optimized queries
4. **CDN**: Static asset optimization

---

_This documentation is maintained alongside the codebase. Please update when making changes to authentication flows._
