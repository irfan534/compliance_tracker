'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export default function Card({ title, description, children, className }: CardProps) {
  return (
    <div className={cn('glass p-6 rounded-3xl shadow-xl', className)}>
      {title && <h3 className="text-lg font-semibold text-foreground">{title}</h3>}
      {description && <p className="mt-2 text-sm text-muted-foreground">{description}</p>}
      <div className="mt-5">{children}</div>
    </div>
  );
}
