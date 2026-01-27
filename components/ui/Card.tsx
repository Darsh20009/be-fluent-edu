import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const cardVariants = cva(
  'rounded-xl transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'bg-[#F9FAFB] border border-[#E5E7EB] shadow-sm',
        elevated: 'bg-[#F9FAFB] shadow-lg border border-[#E5E7EB]',
        outlined: 'bg-[#F9FAFB] border-2 border-[#E5E7EB]',
        white: 'bg-white border border-[#E5E7EB] shadow-sm',
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
        style={{ backgroundColor: variant === 'white' ? '#ffffff' : '#F9FAFB' }}
        {...props}
      >
        {header && (
          <div className="border-b border-[#E5E7EB] px-4 sm:px-6 py-3 sm:py-4 bg-[#F9FAFB]">
            {header}
          </div>
        )}
        <div className={cn(header || footer ? 'p-4 sm:p-6' : '', 'bg-inherit')}>{children}</div>
        {footer && (
          <div className="border-t border-[#E5E7EB] px-4 sm:px-6 py-3 sm:py-4 bg-[#F9FAFB]">
            {footer}
          </div>
        )}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;
