import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const cardVariants = cva(
  'rounded-xl transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'bg-[#F5F1E8] border border-[#d4c9b8] shadow-sm',
        elevated: 'bg-[#F5F1E8] shadow-lg border border-[#d4c9b8]',
        outlined: 'bg-[#F5F1E8] border-2 border-[#d4c9b8]',
        white: 'bg-white border border-[#d4c9b8] shadow-sm',
      },
      padding: {
        none: 'p-0',
        sm: 'p-3 sm:p-4',
        md: 'p-4 sm:p-6',
        lg: 'p-6 sm:p-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, header, footer, children, ...props }, ref) => {
    return (
      <div
        className={cn(cardVariants({ variant, padding: header || footer ? 'none' : padding, className }))}
        ref={ref}
        style={{ backgroundColor: variant === 'white' ? '#ffffff' : '#F5F1E8' }}
        {...props}
      >
        {header && (
          <div className="border-b border-[#d4c9b8] px-4 sm:px-6 py-3 sm:py-4 bg-[#F5F1E8]">
            {header}
          </div>
        )}
        <div className={cn(header || footer ? 'p-4 sm:p-6' : '', 'bg-inherit')}>{children}</div>
        {footer && (
          <div className="border-t border-[#d4c9b8] px-4 sm:px-6 py-3 sm:py-4 bg-[#F5F1E8]">
            {footer}
          </div>
        )}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;
