'use client';

import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type = 'text', ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        'w-full rounded-xl border border-[color:var(--app-input)] bg-[var(--app-panel)] px-4 py-3 text-[15px] text-[var(--app-text)] outline-none transition-all duration-150 placeholder:text-[var(--app-muted)] focus:border-[#0071E3] focus:ring-[3px] focus:ring-[rgba(0,113,227,0.3)]',
        className,
      )}
      {...props}
    />
  ),
);

Input.displayName = 'Input';

export default Input;
