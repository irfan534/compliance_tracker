'use server';

import { headers } from 'next/headers';
import { serverCheckLoginLock, serverClearLoginAttempts, serverRecordFailedAttempt } from './db';

const getRequestIp = async () => {
  const headersList = await headers();
  const forwardedFor = headersList.get('x-forwarded-for');
  return forwardedFor?.split(',')[0]?.trim() || 'localhost';
};

export async function checkLock() {
  const ip = await getRequestIp();
  return serverCheckLoginLock(ip);
}

export async function recordFail() {
  const ip = await getRequestIp();
  return serverRecordFailedAttempt(ip);
}

export async function clearAttempts() {
  const ip = await getRequestIp();
  return serverClearLoginAttempts(ip);
}
