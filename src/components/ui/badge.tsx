import { type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info'

export interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'border-transparent bg-primary text-primary-foreground',
  secondary: 'border-transparent bg-secondary text-secondary-foreground',
  destructive: 'border-transparent bg-danger text-white',
  outline: 'text-foreground',
  success: 'border-transparent bg-success text-white',
  warning: 'border-transparent bg-warning text-white',
  info: 'border-transparent bg-info text-white',
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold', variantStyles[variant], className)} {...props} />
  )
}

export { Badge }