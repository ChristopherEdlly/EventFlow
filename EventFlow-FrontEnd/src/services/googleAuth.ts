/**
 * Google Auth Service
 * Handles Google OAuth authentication
 */

import { api } from './api';

interface GoogleAuthResponse {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  authProvider: string;
  token: string;
}

interface GoogleConfig {
  clientId: string | null;
  configured: boolean;
}

/**
 * Get Google OAuth configuration
 */
export async function getGoogleConfig(): Promise<GoogleConfig> {
  try {
    return await api.get<GoogleConfig>('/auth/google/config');
  } catch {
    return { clientId: null, configured: false };
  }
}

/**
 * Authenticate with Google ID token
 */
export async function authenticateWithGoogle(idToken: string): Promise<GoogleAuthResponse> {
  return api.post<GoogleAuthResponse>('/auth/google', { idToken });
}

/**
 * Send email verification code
 */
export async function sendVerificationCode(email: string): Promise<{ message: string }> {
  return api.post('/auth/send-verification', { email });
}

/**
 * Verify email with code
 */
export async function verifyEmail(code: string): Promise<{ message: string; emailVerified: boolean }> {
  return api.post('/auth/verify-email', { code });
}

/**
 * Resend verification code
 */
export async function resendVerificationCode(): Promise<{ message: string }> {
  return api.post('/auth/resend-verification', {});
}

/**
 * Get verification status
 */
export async function getVerificationStatus(): Promise<{ emailVerified: boolean; authProvider: string }> {
  return api.get('/auth/verification-status');
}
