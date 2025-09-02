import * as z from 'zod';
import { UserRole } from '@prisma/client';

// Type for translation function
type TranslationFunction = (
  key: string,
  values?: Record<string, any>
) => string;

// Helper function to create schemas with translations
const createSchemaWithTranslations = (t: TranslationFunction) => ({
  SettingsSchema: z
    .object({
      name: z.optional(z.string()),
      isTwoFactorEnabled: z.optional(z.boolean()),
      role: z.enum([UserRole.ADMIN, UserRole.USER]),
      email: z.optional(z.string().email()),
      password: z.optional(z.string().min(6)),
      newPassword: z.optional(z.string().min(6)),
    })
    .refine(
      (data) => {
        if (data.password && !data.newPassword) {
          return false;
        }
        return true;
      },
      {
        message: t('Forms.validation.new_password_required'),
        path: ['newPassword'],
      }
    )
    .refine(
      (data) => {
        if (data.newPassword && !data.password) {
          return false;
        }
        return true;
      },
      {
        message: t('Forms.validation.password_required'),
        path: ['password'],
      }
    ),

  NewPasswordSchema: z.object({
    password: z.string().min(6, {
      message: t('Forms.validation.password_min_length', { length: 6 }),
    }),
  }),

  ResetSchema: z.object({
    email: z.string().email({
      message: t('Forms.validation.email_required'),
    }),
  }),

  LoginSchema: z.object({
    email: z.string().email({
      message: t('Forms.validation.email_required'),
    }),
    password: z.string().min(1, {
      message: t('Forms.validation.password_required'),
    }),
    code: z.optional(z.string()),
  }),

  RegisterSchema: z.object({
    email: z.string().email({
      message: t('Forms.validation.email_required'),
    }),
    password: z.string().min(6, {
      message: t('Forms.validation.password_min_length', { length: 6 }),
    }),
    name: z.string().min(1, {
      message: t('Forms.validation.name_required'),
    }),
  }),

  StudentFormSchema: z
    .object({
      name: z
        .string()
        .min(2, {
          message: t('Forms.validation.name_min_length', { length: 2 }),
        })
        .max(50, {
          message: t('Forms.validation.name_max_length', { length: 50 }),
        }),
      email: z.string().email({ message: t('Forms.validation.email_invalid') }),
      password: z
        .string()
        .min(8, {
          message: t('Forms.validation.password_min_length', { length: 8 }),
        }),
      retypePassword: z
        .string()
        .nonempty(t('Forms.validation.retype_password_required')),
      phone: z.string().optional(),
      gender: z.enum(['MALE', 'FEMALE'], {
        required_error: t('Forms.validation.gender_required'),
      }),
      birthDate: z
        .string()
        .optional()
        .refine((date) => !date || !isNaN(Date.parse(date)), {
          message: t('Forms.validation.birth_date_invalid'),
        }),
      referralSource: z.string().optional(),
      isTeacher: z.boolean().optional(),
    })
    .superRefine(({ password, retypePassword }, ctx) => {
      if (password !== retypePassword) {
        ctx.addIssue({
          code: 'custom',
          message: t('Forms.validation.passwords_no_match'),
          path: ['retypePassword'],
        });
      }
    }),

  TeacherRegistrationSchema: z
    .object({
      name: z
        .string()
        .min(2, {
          message: t('Forms.validation.name_min_length', { length: 2 }),
        })
        .max(50, {
          message: t('Forms.validation.name_max_length', { length: 50 }),
        }),
      email: z.string().email({ message: t('Forms.validation.email_invalid') }),
      password: z
        .string()
        .min(8, {
          message: t('Forms.validation.password_min_length', { length: 8 }),
        }),
      retypePassword: z
        .string()
        .nonempty(t('Forms.validation.retype_password_required')),
      phone: z
        .string()
        .min(10, {
          message: t('Forms.validation.phone_min_length', { length: 10 }),
        }),
      gender: z.enum(['MALE', 'FEMALE'], {
        required_error: t('Forms.validation.gender_required'),
      }),
      birthDate: z
        .string()
        .optional()
        .refine((date) => !date || !isNaN(Date.parse(date)), {
          message: t('Forms.validation.birth_date_invalid'),
        }),
      qualifications: z.string().min(10, {
        message: t('Forms.validation.qualifications_required', { length: 10 }),
      }),
      subjects: z
        .string()
        .min(3, { message: t('Forms.validation.subjects_required') }),
      teachingExperience: z
        .number()
        .min(0, { message: t('Forms.validation.experience_negative') })
        .max(50, { message: t('Forms.validation.experience_unrealistic') }),
      referralSource: z.string().optional(),
      isTeacher: z.boolean().default(true),
    })
    .superRefine(({ password, retypePassword }, ctx) => {
      if (password !== retypePassword) {
        ctx.addIssue({
          code: 'custom',
          message: t('Forms.validation.passwords_no_match'),
          path: ['retypePassword'],
        });
      }
    }),
});

// Export function to create schemas with translations
export const createTranslatedSchemas = createSchemaWithTranslations;

// Default schemas without translations for backward compatibility
export const SettingsSchema = z
  .object({
    name: z.optional(z.string()),
    isTwoFactorEnabled: z.optional(z.boolean()),
    role: z.enum([UserRole.ADMIN, UserRole.USER]),
    email: z.optional(z.string().email()),
    password: z.optional(z.string().min(6)),
    newPassword: z.optional(z.string().min(6)),
  })
  .refine(
    (data) => {
      if (data.password && !data.newPassword) {
        return false;
      }

      return true;
    },
    {
      message: 'New password is required!',
      path: ['newPassword'],
    }
  )
  .refine(
    (data) => {
      if (data.newPassword && !data.password) {
        return false;
      }

      return true;
    },
    {
      message: 'Password is required!',
      path: ['password'],
    }
  );

export const NewPasswordSchema = z.object({
  password: z.string().min(6, {
    message: 'Minimum of 6 characters required',
  }),
});

export const ResetSchema = z.object({
  email: z.string().email({
    message: 'Email is required',
  }),
});

export const LoginSchema = z.object({
  email: z.string().email({
    message: 'Email is required',
  }),
  password: z.string().min(1, {
    message: 'Password is required',
  }),
  code: z.optional(z.string()),
});

export const RegisterSchema = z.object({
  email: z.string().email({
    message: 'Email is required',
  }),
  password: z.string().min(6, {
    message: 'Minimum 6 characters required',
  }),
  name: z.string().min(1, {
    message: 'Name is required',
  }),
});

export const StudentFormSchema = z
  .object({
    name: z
      .string()
      .min(2, { message: 'Name must be at least 2 characters.' })
      .max(50, { message: 'Name cannot exceed 50 characters.' }),
    email: z.string().email({ message: 'Invalid email address.' }),
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters.' }),
    retypePassword: z.string().nonempty('Retype Password is required'),
    phone: z.string().optional(),
    gender: z.enum(['MALE', 'FEMALE'], {
      required_error: 'Gender is required.',
    }),
    birthDate: z
      .string()
      .optional()
      .refine((date) => !date || !isNaN(Date.parse(date)), {
        message: 'Invalid birth date format. Use YYYY-MM-DD.',
      }),
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

export const TeacherRegistrationSchema = z
  .object({
    name: z
      .string()
      .min(2, { message: 'Name must be at least 2 characters.' })
      .max(50, { message: 'Name must be less than 50 characters.' }),
    email: z.string().email({ message: 'Invalid email address.' }),
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters.' }),
    retypePassword: z.string().nonempty('Retype Password is required'),
    phone: z
      .string()
      .min(10, { message: 'Phone number must be at least 10 digits.' }),
    gender: z.enum(['MALE', 'FEMALE'], {
      required_error: 'Gender is required.',
    }),
    birthDate: z
      .string()
      .optional()
      .refine((date) => !date || !isNaN(Date.parse(date)), {
        message: 'Invalid birth date format. Use YYYY-MM-DD.',
      }),
    qualifications: z.string().min(10, {
      message:
        'Please provide detailed qualifications (minimum 10 characters).',
    }),
    subjects: z
      .string()
      .min(3, { message: 'Please specify subjects you can teach.' }),
    teachingExperience: z
      .number()
      .min(0, { message: 'Teaching experience cannot be negative.' })
      .max(50, { message: 'Please enter a realistic number of years.' }),
    referralSource: z.string().optional(),
    isTeacher: z.boolean().default(true),
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
