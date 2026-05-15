'use client';

import { FormEvent, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { checkLock, clearAttempts, recordFail } from '@/app/actions/auth';
import Button from '@/components/ui/button';
import Card from '@/components/ui/card';
import Input from '@/components/ui/input';
import { useAppSettings } from '@/components/providers/app-settings-provider';
import {
  getStoredAuthToken,
  isValidAccessHash,
  setStoredAuthToken,
  sanitizeHashInput,
  isLoginLocked,
} from '@/lib/auth';
import { PERSONAL_KEY_MAP } from '@/lib/auth-config';

export default function LoginPage() {
  const router = useRouter();
  const { appName } = useAppSettings();
  const [hash, setHash] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutMinutes, setLockoutMinutes] = useState(0);
  const [showRecovery, setShowRecovery] = useState(false);
  const [personalKey, setPersonalKey] = useState('');
  const [recoveryError, setRecoveryError] = useState('');
  const [revealedHash, setRevealedHash] = useState('');

  // Check if already logged in
  useEffect(() => {
    if (getStoredAuthToken()) {
      router.replace('/dashboard');
    }
  }, [router]);

  // Update lockout countdown
  useEffect(() => {
    const locked = isLoginLocked();
    setIsLocked(locked.isLocked);
    setLockoutMinutes(locked.minutesRemaining);

    if (!locked.isLocked) {
      return;
    }

    const interval = setInterval(() => {
      const currentLocked = isLoginLocked();
      setLockoutMinutes(currentLocked.minutesRemaining);

      if (!currentLocked.isLocked) {
        setIsLocked(false);
        setError('');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const locked = await checkLock();
    if (locked.isLocked) {
      setIsLocked(true);
      setLockoutMinutes(locked.minutesRemaining);
      setError(`Locked for ${locked.minutesRemaining} more minute(s).`);
      return;
    }

    setSubmitting(true);
    setError('');

    // Sanitize input: strip non-alphanumeric
    const sanitized = sanitizeHashInput(hash);

    if (!isValidAccessHash(sanitized)) {
      const result = await recordFail();
      setSubmitting(false);

      if (result.isLocked) {
        setIsLocked(true);
        setLockoutMinutes(result.minutesRemaining);
        setError(result.message);
      } else {
        setError('Invalid access hash');
      }
      return;
    }

    // Valid hash
    try {
      await clearAttempts();
      await setStoredAuthToken(sanitized);
      router.replace('/dashboard');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to establish session.';
      setError(message);
      setSubmitting(false);
    }
  };

  const handleRecovery = () => {
    const cleaned = personalKey.trim();
    const hashes = PERSONAL_KEY_MAP[cleaned];
    if (!hashes) {
      setRecoveryError('Invalid personal key.');
      setRevealedHash('');
      return;
    }
    setRecoveryError('');
    setRevealedHash(hashes.join('\n'));
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F5F5F7] px-6 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.92),transparent_54%),linear-gradient(180deg,rgba(255,255,255,0.65),rgba(245,245,247,0.96))]" />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md"
      >
        <Card className="border-[#E5E5E5] bg-white p-8 shadow-[0_18px_60px_rgba(0,0,0,0.08)]">
          <div className="mb-8 text-center">
            <Image
              src="/logo.jpeg"
              alt="Compliance Tracking"
              width={180}
              height={72}
              style={{ objectFit: 'contain', borderRadius: '10px', marginBottom: '24px' }}
              className="mx-auto"
            />
            <p className="page-eyebrow">Secure Access</p>
            <p className="mt-2 text-sm text-[#6E6E73]">Enter your assigned access hash to continue.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="access-hash" className="text-sm font-medium text-[#1D1D1F]">
                Enter Access Hash
              </label>
              <Input
                id="access-hash"
                type="password"
                autoFocus
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                value={hash}
                onChange={(event) => {
                  setHash(event.target.value);
                  setError('');
                }}
                placeholder="••••••••••"
                disabled={isLocked}
                className="text-base"
              />
              <p className="text-xs text-[#6E6E73]">10-character alphanumeric hash (case-sensitive)</p>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-[#FFC5C1] bg-[#FFECEB] p-3">
                <p className="text-sm text-[#7A0000]">{error}</p>
              </motion.div>
            )}

            {isLocked && lockoutMinutes > 0 && (
              <div className="rounded-xl border border-[#FFD7A1] bg-[#FFF4E5] p-3">
                <p className="text-sm text-[#7A4500]">🔒 Locked for {lockoutMinutes} minute{lockoutMinutes !== 1 ? 's' : ''}</p>
              </div>
            )}

            <Button type="submit" disabled={submitting || isLocked} className="w-full" size="lg">
              {submitting ? 'Verifying...' : 'Access Dashboard'}
            </Button>

            <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px', color: '#6E6E73' }}>
              Forgot your hash?{' '}
              <button
                type="button"
                onClick={() => setShowRecovery(true)}
                style={{
                  color: '#1D1D1F',
                  fontWeight: 500,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '13px',
                  textDecoration: 'underline',
                }}
              >
                Enter personal key
              </button>
            </p>
          </form>
        </Card>

        {showRecovery && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 50,
            }}
          >
            <div
              style={{
                background: '#fff',
                borderRadius: '20px',
                padding: '32px',
                width: '100%',
                maxWidth: '400px',
                boxShadow: '0 24px 60px rgba(0,0,0,0.15)',
              }}
            >
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1D1D1F', marginBottom: '8px' }}>
                Personal Key Recovery
              </h2>
              <p style={{ fontSize: '14px', color: '#6E6E73', marginBottom: '24px' }}>
                Enter your personal recovery key to retrieve your access hash.
              </p>

              <input
                type="password"
                placeholder="Enter personal key"
                value={personalKey}
                onChange={(e) => setPersonalKey(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: '1px solid #D2D2D7',
                  fontSize: '14px',
                  color: '#1D1D1F',
                  outline: 'none',
                  marginBottom: '12px',
                  boxSizing: 'border-box',
                }}
              />

              {recoveryError && (
                <p style={{ color: '#FF3B30', fontSize: '13px', marginBottom: '12px' }}>
                  {recoveryError}
                </p>
              )}

              {revealedHash && (
                <div
                  style={{
                    background: '#F5F5F7',
                    borderRadius: '10px',
                    padding: '14px',
                    marginBottom: '16px',
                  }}
                >
                  <p
                    style={{
                      fontSize: '12px',
                      color: '#6E6E73',
                      marginBottom: '10px',
                      textAlign: 'center',
                    }}
                  >
                    ACCESS HASHES
                  </p>
                  {revealedHash.split('\n').map((hash, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 10px',
                        background: '#fff',
                        borderRadius: '8px',
                        marginBottom: '6px',
                        border: '1px solid #E5E5E5',
                      }}
                    >
                      <span style={{ fontSize: '13px', color: '#6E6E73' }}>User {i + 1}</span>
                      <span
                        style={{
                          fontSize: '16px',
                          fontWeight: 700,
                          color: '#1D1D1F',
                          letterSpacing: '2px',
                          fontFamily: 'monospace',
                        }}
                      >
                        {hash}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={handleRecovery}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '980px',
                    background: '#1D1D1F',
                    color: '#fff',
                    fontWeight: 500,
                    fontSize: '14px',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Recover Hash
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowRecovery(false);
                    setPersonalKey('');
                    setRecoveryError('');
                    setRevealedHash('');
                  }}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '980px',
                    background: '#F5F5F7',
                    color: '#1D1D1F',
                    fontWeight: 500,
                    fontSize: '14px',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </main>
  );
}
