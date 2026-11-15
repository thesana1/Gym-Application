export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  CredentialsSignin: 'Wrong email or password. Please try again.',
  SESSION_FAILED: 'We could not sign you in. Please try again.',
  REGISTER_FAILED: 'We could not create your account. Please try again.',
  DATABASE_NOT_CONFIGURED: 'Creating accounts is not working right now. Please try later.',
  EMAIL_TAKEN: 'This email already has an account. Please sign in.',
  AccessDenied: 'Sign in was stopped. Please try another way.',
  OAuthAccountNotLinked: 'This email uses a different way to sign in. Please use that way.',
  Configuration: 'Sign in is not working right now. Please try later.',
  OAuthCallbackError: 'Google sign in did not finish. Try again, or use your email.',
  OAuthSignin: 'Google sign in did not start. Try again, or use your email.',
};
