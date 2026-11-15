import { z } from 'zod';

const emailField = z.string().trim().email({ message: 'Enter a valid email address' });

export const LoginSchema = z.object({
  email: emailField,
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters' })
    .max(100, { message: 'Password must be 100 characters or fewer' }),
});

export type LoginType = z.infer<typeof LoginSchema>;

export const SignUpSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, { message: 'Enter your full name (at least 2 characters)' })
    .max(100, { message: 'Name must be 100 characters or fewer' }),
  email: emailField,
  password: z
    .string()
    .min(8, { message: 'Use at least 8 characters for your password' })
    .max(100, { message: 'Password must be 100 characters or fewer' }),
});

export type SignUpType = z.infer<typeof SignUpSchema>;
