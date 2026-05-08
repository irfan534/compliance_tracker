'use client';

import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'destructive';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const badgeStyles = {
  default: 'bg-emerald-100 text-emerald-700',
  secondary: 'bg-amber-100 text-amber-700',
  destructive: 'bg-rose-100 text-rose-700',
};

export default function Badge({ children, variant = 'default', className, size = 'md' }: BadgeProps) {
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-xs',
    lg: 'px-4 py-2 text-sm',
  };
  
  return (
    <span className={cn('inline-flex rounded-full font-semibold', badgeStyles[variant], sizes[size], className)}>
      {children}
    </span>
  );
}
