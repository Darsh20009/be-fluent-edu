import React, { useState } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { AlertCircle, Check, Eye, EyeOff } from 'lucide-react';

const inputVariants = cva(
  'flex w-full rounded-lg border bg-white px-4 py-2 text-base text-black transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 rtl:text-right',
  {
    variants: {
      variant: {
        default: 'border-neutral-300 focus-visible:ring-primary-500 focus-visible:border-primary-500',
        error: 'border-error-500 focus-visible:ring-error-500 text-error-900',
        success: 'border-success-500 focus-visible:ring-success-500 text-success-900',
      },
      inputSize: {
        sm: 'h-9 text-sm px-3',
        md: 'h-11 text-base px-4',
        lg: 'h-13 text-lg px-5',
      },
    },
    defaultVariants: {
      variant: 'default',
      inputSize: 'md',
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: string;
  error?: string;
  success?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  inputSize?: 'sm' | 'md' | 'lg';
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant,
      inputSize,
      label,
      error,
      success,
      hint,
      leftIcon,
      rightIcon,
      id,
      type,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    const showError = error && variant === 'error';
    const showSuccess = success && variant === 'success';
    const isPasswordField = type === 'password';
    const inputType = isPasswordField && showPassword ? 'text' : type;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-black rtl:text-right"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 rtl:left-auto rtl:right-3">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            type={inputType}
            className={cn(
              inputVariants({ variant, inputSize }),
              leftIcon && 'pl-10 rtl:pr-10 rtl:pl-4',
              (rightIcon || showError || showSuccess || isPasswordField) && 'pr-10 rtl:pl-10 rtl:pr-4',
              className
            )}
            ref={ref}
            aria-invalid={showError ? true : undefined}
            aria-describedby={
              showError
                ? `${inputId}-error`
                : showSuccess
                ? `${inputId}-success`
                : hint
                ? `${inputId}-hint`
                : undefined
            }
            {...props}
          />
          {showError && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-error-500 rtl:right-auto rtl:left-3">
              <AlertCircle className="h-5 w-5" aria-hidden="true" />
            </div>
          )}
          {showSuccess && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-success-500 rtl:right-auto rtl:left-3">
              <Check className="h-5 w-5" aria-hidden="true" />
            </div>
          )}
          {isPasswordField && !showError && !showSuccess && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors rtl:right-auto rtl:left-3"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Eye className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          )}
          {!showError && !showSuccess && !isPasswordField && rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 rtl:right-auto rtl:left-3">
              {rightIcon}
            </div>
          )}
        </div>
        {showError && (
          <p id={`${inputId}-error`} className="text-sm text-error-600 rtl:text-right" role="alert">
            {error}
          </p>
        )}
        {showSuccess && (
          <p id={`${inputId}-success`} className="text-sm text-success-600 rtl:text-right">
            {success}
          </p>
        )}
        {hint && !showError && !showSuccess && (
          <p id={`${inputId}-hint`} className="text-sm text-neutral-500 rtl:text-right">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;