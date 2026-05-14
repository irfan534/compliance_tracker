'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, type = 'button', variant = 'default', size = 'md', ...props }, ref) => {
    const variants = {
      default: 'border border-black bg-black text-white shadow-none hover:border-[#1D1D1F] hover:bg-[#1D1D1F] active:bg-[#000000]',
      outline: 'border border-black bg-black text-white shadow-none hover:border-[#1D1D1F] hover:bg-[#1D1D1F] active:bg-[#000000]',
      secondary: 'border border-black bg-black text-white shadow-none hover:border-[#1D1D1F] hover:bg-[#1D1D1F] active:bg-[#000000]',
      ghost: 'border border-black bg-black text-white shadow-none hover:border-[#1D1D1F] hover:bg-[#1D1D1F] active:bg-[#000000]',
    };

    const sizes = {
      sm: 'h-9 px-4 text-[13px]',
      md: 'h-11 px-5 text-[14px]',
      lg: 'h-12 px-6 text-[15px]',
    };

    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          'inline-flex items-center justify-center rounded-full font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-60',
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = 'Button';

export default Button;
