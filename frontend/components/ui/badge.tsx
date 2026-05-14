'use client';

import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'destructive';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const badgeStyles = {
  default: 'border border-[#CDEFD6] bg-[#E8F8EC] text-[#1A7F37]',
  secondary: 'border border-[#FFD7A1] bg-[#FFF4E5] text-[#7A4500]',
  destructive: 'border border-[#FFC5C1] bg-[#FFECEB] text-[#7A0000]',
};

export default function Badge({ children, variant = 'default', className, size = 'md' }: BadgeProps) {
  const sizes = {
    sm: 'px-2.5 py-1 text-[11px]',
    md: 'px-3 py-1 text-[12px]',
    lg: 'px-4 py-1.5 text-[13px]',
  };
  
  return (
    <span className={cn('inline-flex items-center rounded-full font-semibold', badgeStyles[variant], sizes[size], className)}>
      {children}
    </span>
  );
}
