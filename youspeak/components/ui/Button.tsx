import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95',
  {
    variants: {
      variant: {
        primary: 'bg-[#004E89] text-white hover:bg-[#003A6B] focus-visible:ring-[#004E89] shadow-sm',
        secondary: 'bg-[#F5F1E8] text-black hover:bg-[#E8E4D8] focus-visible:ring-neutral-500 border border-[#d4c9b8]',
        accent: 'bg-accent text-neutral-900 hover:bg-accent-600 focus-visible:ring-accent-500 shadow-sm',
        outline: 'border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-white focus-visible:ring-primary-500',
        ghost: 'bg-transparent hover:bg-neutral-100 text-neutral-900 dark:hover:bg-neutral-800 dark:text-neutral-100',
        danger: 'bg-error text-white hover:bg-error-600 focus-visible:ring-error-500 shadow-sm',
        success: 'bg-success text-white hover:bg-success-600 focus-visible:ring-success-500 shadow-sm',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-11 px-5 text-base',
        lg: 'h-13 px-7 text-lg',
        xl: 'h-15 px-9 text-xl',
        icon: 'h-10 w-10',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      loading = false,
      disabled,
      leftIcon,
      rightIcon,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {!loading && leftIcon && <span aria-hidden="true">{leftIcon}</span>}
        {children}
        {!loading && rightIcon && <span aria-hidden="true">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
