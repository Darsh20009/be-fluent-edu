import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const spinnerVariants = cva('animate-spin', {
  variants: {
    size: {
      xs: 'h-3 w-3',
      sm: 'h-4 w-4',
      md: 'h-6 w-6',
      lg: 'h-8 w-8',
      xl: 'h-12 w-12',
    },
    variant: {
      primary: 'text-primary',
      accent: 'text-accent',
      neutral: 'text-neutral-500',
      white: 'text-white',
    },
  },
  defaultVariants: {
    size: 'md',
    variant: 'primary',
  },
});

export interface LoadingSpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  label?: string;
  fullScreen?: boolean;
}

const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ className, size, variant, label, fullScreen = false, ...props }, ref) => {
    const spinner = (
      <div
        className={cn(
          'flex flex-col items-center justify-center gap-3',
          fullScreen && 'fixed inset-0 bg-white/80 backdrop-blur-sm dark:bg-neutral-900/80 z-50',
          className
        )}
        ref={ref}
        role="status"
        aria-live="polite"
        aria-label={label || 'Loading'}
        {...props}
      >
        <Loader2 className={cn(spinnerVariants({ size, variant }))} aria-hidden="true" />
        {label && (
          <p className="text-sm text-neutral-600 dark:text-neutral-400 rtl:text-right">
            {label}
          </p>
        )}
        <span className="sr-only">{label || 'Loading...'}</span>
      </div>
    );

    return spinner;
  }
);

LoadingSpinner.displayName = 'LoadingSpinner';

export default LoadingSpinner;
