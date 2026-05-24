import { type ClassValue, clsx } from 'clsx';
import { twMerge }               from 'tailwind-merge';

/** Merge Tailwind classes safely (shadcn/ui pattern). */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Format a number as Philippine Peso currency string. */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-PH', {
    style   : 'currency',
    currency: 'PHP',
  }).format(amount);
}

/** Format an ISO date string to readable local date. */
export function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('en-PH', {
    year : 'numeric',
    month: 'long',
    day  : 'numeric',
  });
}
