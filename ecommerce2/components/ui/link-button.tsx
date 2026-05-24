import Link from 'next/link';
import { Button, type ButtonProps } from '@/components/ui/button';

interface LinkButtonProps extends ButtonProps {
  href: string;
}

/** Next.js App Router–safe button link (avoids legacy passHref patterns). */
export function LinkButton({ href, children, className, ...props }: LinkButtonProps) {
  return (
    <Button asChild className={className} {...props}>
      <Link href={href}>{children}</Link>
    </Button>
  );
}
