import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[--color-eucalyptus] focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-[--color-eucalyptus] text-white',
        secondary: 'border-transparent bg-[--color-surface] text-[--color-slate-700]',
        destructive: 'border-transparent bg-[--color-danger] text-white',
        warning: 'border-transparent bg-[--color-warning] text-white',
        success: 'border-transparent bg-[--color-eucalyptus-bg] text-[--color-eucalyptus]',
        outline: 'text-[--color-slate-700] border-[--color-border]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
