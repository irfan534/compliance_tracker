import { ACCESS_HASHES } from '@/lib/auth-config';

// Opaque storage keys — not obvious from DevTools
const SESSION_TOKEN_KEY = '_ct';
const FAILED_ATTEMPTS_KEY = '_fa';
const LOCKOUT_TIMESTAMP_KEY = '_fl';
const LAST_ACTIVITY_KEY = '_la';

// Configuration
const MAX_FAILED_ATTEMPTS_SOFT = 5; // Lock for 15 min
const MAX_FAILED_ATTEMPTS_HARD = 15; // Lock for 24 hours
const SOFT_LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
const HARD_LOCKOUT_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const SESSION_TIMEOUT = 8 * 60 * 60 * 1000; // 8 hours

/**
 * Derive a session token from the access hash
 * Includes timestamp to prevent token reuse
 */
async function deriveSessionToken(hash: string): Promise<string> {
  if (typeof window !== 'undefined' && !window.isSecureContext) {
    throw new Error(
      'Insecure Context: Browser security requires HTTPS or localhost to generate secure sessions.'
    );
  }
  const encoder = new TextEncoder();
  const timestamp = Date.now();
  const data = encoder.encode(`${hash}${timestamp}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const token = btoa(String.fromCharCode(...hashArray)).slice(0, 32);
  return `${token}:${timestamp}`;
}

/**
 * Get stored session token (opaque, not raw hash)
 */
export function getStoredAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  const token = window.sessionStorage.getItem(SESSION_TOKEN_KEY);
  if (!token) return null;

  // Check session expiry (8h inactivity)
  const lastActivity = window.sessionStorage.getItem(LAST_ACTIVITY_KEY);
  if (lastActivity) {
    const inactiveTime = Date.now() - parseInt(lastActivity, 10);
    if (inactiveTime > SESSION_TIMEOUT) {
      clearAuthState();
      return null;
    }
  }

  return token;
}

/**
 * Set session token (derived, not raw hash)
 */
export async function setStoredAuthToken(hash: string): Promise<void> {
  if (typeof window === 'undefined') return;

  const token = await deriveSessionToken(hash);
  window.sessionStorage.setItem(SESSION_TOKEN_KEY, token);
  window.sessionStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));

  // Clear failed attempts on successful login
  window.sessionStorage.removeItem(FAILED_ATTEMPTS_KEY);
  window.sessionStorage.removeItem(LOCKOUT_TIMESTAMP_KEY);
}

/**
 * Clear all auth state
 */
export function clearAuthToken(): void {
  clearAuthState();
}

function clearAuthState(): void {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(SESSION_TOKEN_KEY);
  window.sessionStorage.removeItem(LAST_ACTIVITY_KEY);
}

/**
 * Update last activity timestamp
 */
export function updateLastActivity(): void {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
}

/**
 * Sanitize hash input: strip non-alphanumeric
 */
export function sanitizeHashInput(input: string): string {
  return input.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10);
}

/**
 * Validate access hash — must be exactly 10 chars and in ACCESS_HASHES
 */
export function isValidAccessHash(hash: string): boolean {
  return hash.length === 10 && ACCESS_HASHES.includes(hash as any);
}

/**
 * Track failed login attempts (brute force protection)
 */
export function recordFailedAttempt(): {
  attempts: number;
  isLocked: boolean;
  lockoutEndTime: number | null;
  message: string;
} {
  if (typeof window === 'undefined') {
    return { attempts: 0, isLocked: false, lockoutEndTime: null, message: '' };
  }

  const lockoutTimestamp = window.sessionStorage.getItem(LOCKOUT_TIMESTAMP_KEY);
  const now = Date.now();

  // Check if under hard lockout (24h)
  if (lockoutTimestamp) {
    const lockoutTime = parseInt(lockoutTimestamp, 10);
    const hardLockoutEnd = lockoutTime + HARD_LOCKOUT_DURATION;

    if (now < hardLockoutEnd) {
      const minutesRemaining = Math.ceil((hardLockoutEnd - now) / 60 / 1000);
      return {
        attempts: MAX_FAILED_ATTEMPTS_HARD,
        isLocked: true,
        lockoutEndTime: hardLockoutEnd,
        message: `Account locked for ${minutesRemaining} minutes. Too many failed attempts.`,
      };
    } else {
      // Hard lockout expired, reset
      window.sessionStorage.removeItem(FAILED_ATTEMPTS_KEY);
      window.sessionStorage.removeItem(LOCKOUT_TIMESTAMP_KEY);
    }
  }

  // Increment failed attempts
  const attemptsStr = window.sessionStorage.getItem(FAILED_ATTEMPTS_KEY) || '0';
  let attempts = parseInt(attemptsStr, 10) + 1;
  window.sessionStorage.setItem(FAILED_ATTEMPTS_KEY, String(attempts));

  // Check if we've reached hard lockout threshold
  if (attempts >= MAX_FAILED_ATTEMPTS_HARD) {
    window.sessionStorage.setItem(LOCKOUT_TIMESTAMP_KEY, String(now));
    return {
      attempts: MAX_FAILED_ATTEMPTS_HARD,
      isLocked: true,
      lockoutEndTime: now + HARD_LOCKOUT_DURATION,
      message: 'Too many failed attempts. Account locked for 24 hours.',
    };
  }

  // Check if we've reached soft lockout threshold
  if (attempts >= MAX_FAILED_ATTEMPTS_SOFT) {
    window.sessionStorage.setItem(LOCKOUT_TIMESTAMP_KEY, String(now));
    return {
      attempts,
      isLocked: true,
      lockoutEndTime: now + SOFT_LOCKOUT_DURATION,
      message: `Too many failed attempts. Try again in 15 minutes.`,
    };
  }

  return {
    attempts,
    isLocked: false,
    lockoutEndTime: null,
    message: '',
  };
}

/**
 * Check if login is currently locked
 */
export function isLoginLocked(): {
  isLocked: boolean;
  lockoutEndTime: number | null;
  minutesRemaining: number;
} {
  if (typeof window === 'undefined') {
    return { isLocked: false, lockoutEndTime: null, minutesRemaining: 0 };
  }

  const lockoutTimestamp = window.sessionStorage.getItem(LOCKOUT_TIMESTAMP_KEY);
  if (!lockoutTimestamp) {
    return { isLocked: false, lockoutEndTime: null, minutesRemaining: 0 };
  }

  const lockoutTime = parseInt(lockoutTimestamp, 10);
  const now = Date.now();
  const attempts = parseInt(window.sessionStorage.getItem(FAILED_ATTEMPTS_KEY) || '0', 10);

  // Determine which lockout duration applies
  const duration = attempts >= MAX_FAILED_ATTEMPTS_HARD ? HARD_LOCKOUT_DURATION : SOFT_LOCKOUT_DURATION;
  const lockoutEnd = lockoutTime + duration;

  if (now < lockoutEnd) {
    const minutesRemaining = Math.ceil((lockoutEnd - now) / 60 / 1000);
    return { isLocked: true, lockoutEndTime: lockoutEnd, minutesRemaining };
  }

  // Lockout expired
  window.sessionStorage.removeItem(FAILED_ATTEMPTS_KEY);
  window.sessionStorage.removeItem(LOCKOUT_TIMESTAMP_KEY);
  return { isLocked: false, lockoutEndTime: null, minutesRemaining: 0 };
}
