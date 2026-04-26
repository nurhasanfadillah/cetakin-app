import { type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info' | 'glow'

export interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'border-transparent bg-primary/20 text-primary border border-primary/30',
  secondary: 'border-transparent bg-surface-elevated text-text-secondary border border-border',
  destructive: 'border-transparent bg-danger-light text-danger-foreground border border-danger/30',
  outline: 'border-border text-text-muted',
  success: 'border-transparent bg-success-light text-success-foreground border border-success/30',
  warning: 'border-transparent bg-warning-light text-warning-foreground border border-warning/30',
  info: 'border-transparent bg-info-light text-info-foreground border border-info/30',
  glow: 'border-transparent bg-primary/20 text-primary-foreground border border-primary/50 shadow-glow-blue',
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div 
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all duration-200', 
        variantStyles[variant], 
        className
      )} 
      {...props} 
    />
  )
}

export { Badge }