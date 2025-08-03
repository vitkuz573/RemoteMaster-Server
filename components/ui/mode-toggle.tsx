import React from 'react';
import { Toggle } from '@/components/ui/toggle';
import { cn } from '@/lib/utils';

interface ModeToggleProps {
  modes: Array<{
    id: string;
    label: string;
    icon?: React.ReactNode;
  }>;
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export function ModeToggle({
  modes,
  value,
  onValueChange,
  disabled = false,
  className
}: ModeToggleProps) {
  return (
    <div className={cn("flex items-center justify-center space-x-1", className)}>
      {modes.map((mode) => (
        <Toggle
          key={mode.id}
          pressed={value === mode.id}
          onPressedChange={() => onValueChange(mode.id)}
          disabled={disabled}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
            value === mode.id
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          {mode.icon && <span className="mr-2">{mode.icon}</span>}
          {mode.label}
        </Toggle>
      ))}
    </div>
  );
} 