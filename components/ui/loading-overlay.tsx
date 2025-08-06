import { cn } from '@/lib/utils';
import { LoadingSpinner } from './loading-spinner';

interface LoadingOverlayProps {
  isLoading: boolean;
  text?: string;
  className?: string;
}

export function LoadingOverlay({ isLoading, text, className }: LoadingOverlayProps) {
  if (!isLoading) return null;

  return (
    <div className={cn(
      "fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm",
      className
    )}>
      <LoadingSpinner size="lg" text={text} />
    </div>
  );
} 