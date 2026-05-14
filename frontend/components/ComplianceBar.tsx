'use client';

interface ComplianceBarProps {
  value: number;
  label?: string;
}

export default function ComplianceBar({ value, label }: ComplianceBarProps) {
  const normalizedValue = Math.max(0, Math.min(100, value));
  const fillColor = normalizedValue >= 80 ? '#34C759' : normalizedValue >= 50 ? '#FF9500' : '#FF3B30';

  return (
    <div className="space-y-3">
      <div className="h-1.5 overflow-hidden rounded-full bg-[#E5E5E5]">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${normalizedValue}%`, backgroundColor: fillColor }}
        />
      </div>
      {label ? <p className="text-[13px] text-[#6E6E73]">{label}</p> : null}
    </div>
  );
}
