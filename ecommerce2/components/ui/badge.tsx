import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'bg-emerald-600 hover:bg-emerald-500 text-white',
        secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-800',
        destructive: 'bg-rose-50 border-rose-200 text-rose-700 border hover:bg-rose-100',
        outline: 'text-gray-700 border border-gray-200 hover:bg-gray-50',
        info: 'bg-sky-50 border-sky-200 text-sky-700 border',
        warning: 'bg-amber-50 border-amber-200 text-amber-800 border',
        success: 'bg-emerald-50 border-emerald-200 text-emerald-700 border',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
