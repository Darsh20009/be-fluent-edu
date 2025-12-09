import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react';

const alertVariants = cva(
  'relative w-full rounded-lg border-2 p-4 [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:rtl:left-auto [&>svg]:rtl:right-4 [&>svg+div]:pl-8 [&>svg+div]:rtl:pr-8 [&>svg+div]:rtl:pl-0',
  {
    variants: {
      variant: {
        info: 'bg-blue-50 text-blue-900 border-blue-400',
        success: 'bg-green-50 text-green-900 border-green-400',
        warning: 'bg-yellow-50 text-yellow-900 border-yellow-400',
        error: 'bg-red-50 text-red-900 border-red-400',
      },
    },
    defaultVariants: {
      variant: 'info',
    },
  }
);

const iconMap = {
  info: Info,
  success: CheckCircle,
  warning: AlertCircle,
  error: XCircle,
};

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  title?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'info', title, dismissible, onDismiss, children, ...props }, ref) => {
    const Icon = variant ? iconMap[variant] : iconMap.info;

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(alertVariants({ variant }), className)}
        {...props}
      >
        {Icon && <Icon className="h-5 w-5" aria-hidden="true" />}
        <div className={cn(dismissible && 'pr-8 rtl:pl-8 rtl:pr-0')}>
          {title && (
            <h5 className="mb-1 font-medium leading-none tracking-tight rtl:text-right">
              {title}
            </h5>
          )}
          <div className="text-sm [&_p]:leading-relaxed rtl:text-right">{children}</div>
        </div>
        {dismissible && (
          <button
            onClick={onDismiss}
            className="absolute right-4 top-4 text-current opacity-70 hover:opacity-100 transition-opacity rtl:right-auto rtl:left-4"
            aria-label="Dismiss alert"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
    );
  }
);

Alert.displayName = 'Alert';

export default Alert;