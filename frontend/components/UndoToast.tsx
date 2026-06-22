'use client';

import Button from '@/components/ui/button';

interface UndoToastProps {
  open: boolean;
  message: string;
  onUndo: () => void;
  undoing: boolean;
}

export default function UndoToast({ open, message, onUndo, undoing }: UndoToastProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-1/2 z-50 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 rounded-[16px] border border-[#E5E5E5] bg-white px-5 py-4 text-[#1D1D1F] shadow-[0_12px_32px_rgba(0,0,0,0.12)]">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-[#1D1D1F]">{message} Undo within 5 seconds.</p>
        <Button
          variant="outline"
          onClick={onUndo}
          disabled={undoing}
          className="min-w-[108px]"
        >
          {undoing ? 'Restoring...' : 'Undo'}
        </Button>
      </div>
    </div>
  );
}
