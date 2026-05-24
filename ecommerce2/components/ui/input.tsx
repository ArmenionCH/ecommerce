import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus:outline-hidden focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50',
          error
            ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200/50'
            : 'border-gray-200 hover:border-gray-300 focus:border-emerald-500 focus:ring-emerald-200/50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
