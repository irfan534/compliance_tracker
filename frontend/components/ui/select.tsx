'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children?: React.ReactNode;
  className?: string;
}

interface SelectTriggerProps {
  children: React.ReactNode;
  className?: string;
}

interface SelectValueProps {
  placeholder?: string;
  className?: string;
}

interface SelectContentProps {
  children: React.ReactNode;
  className?: string;
}

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export function Select({ value, onValueChange, children, className }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <SelectContext.Provider value={{ value, isOpen, setIsOpen, onValueChange }}>
      <div className={cn('relative', className)}>
        {children}
      </div>
    </SelectContext.Provider>
  );
}

export function SelectTrigger({ children, className }: SelectTriggerProps) {
  const { isOpen, setIsOpen } = React.useContext(SelectContext);
  
  return (
    <button
      type="button"
      onClick={() => setIsOpen?.(!isOpen)}
      className={cn(
        'flex h-11 w-full items-center justify-between rounded-xl border border-[color:var(--app-input)] bg-[var(--app-panel)] px-4 py-3 text-[15px] text-[var(--app-text)] transition-all duration-150 placeholder:text-[var(--app-muted)] focus:border-[#0071E3] focus:ring-[3px] focus:ring-[rgba(0,113,227,0.3)] disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  );
}

export function SelectValue({ placeholder, className }: SelectValueProps) {
  const { value } = React.useContext(SelectContext);
  
  return (
    <span className={cn('block truncate', className)}>
      {value || placeholder}
    </span>
  );
}

export function SelectContent({ children, className }: SelectContentProps) {
  const { isOpen } = React.useContext(SelectContext);
  
  if (!isOpen) return null;
  
  return (
    <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-2xl border border-[color:var(--app-border)] bg-[var(--app-panel)] p-2 text-[var(--app-text)] shadow-[0_12px_32px_rgba(0,0,0,0.08)]">
      {children}
    </div>
  );
}

export function SelectItem({ value, children, className }: SelectItemProps) {
  const { onValueChange, setIsOpen } = React.useContext(SelectContext);
  
  return (
    <div
      className={cn(
        'relative flex w-full cursor-pointer select-none items-center rounded-xl px-4 py-2.5 text-[14px] text-[var(--app-text)] outline-none hover:bg-[var(--app-surface)] focus:bg-[var(--app-surface)]',
        className
      )}
      onClick={() => {
        onValueChange?.(value);
        setIsOpen?.(false);
      }}
    >
      {children}
    </div>
  );
}

const SelectContext = React.createContext<{
  value?: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onValueChange?: (value: string) => void;
}>({
  isOpen: false,
  setIsOpen: () => {},
});
