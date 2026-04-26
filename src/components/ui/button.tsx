import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        default: 'bg-primary text-white hover:bg-primary-hover shadow-md hover:shadow-lg hover:shadow-primary-glow/30 active:shadow-sm',
        secondary: 'bg-surface-elevated text-text-primary hover:bg-surface-highlight border border-border',
        accent: 'bg-accent text-accent-foreground hover:bg-accent-hover shadow-md hover:shadow-accent-glow/30',
        outline: 'border border-border bg-transparent hover:bg-surface-elevated hover:border-primary/50',
        ghost: 'hover:bg-surface-elevated hover:text-text-primary',
        link: 'text-primary underline-offset-4 hover:underline h-auto p-0',
        whatsapp: 'bg-whatsapp text-white hover:bg-whatsapp-hover shadow-md',
        success: 'bg-success text-success-foreground hover:bg-success/90 shadow-success-glow/30',
        danger: 'bg-danger text-danger-foreground hover:bg-danger/90 shadow-danger-glow/30',
        glow: 'bg-primary text-white shadow-glow-blue hover:shadow-glow-blue hover:scale-[1.02]',
      },
      size: {
        default: 'h-11 px-5 py-2 rounded-xl',
        sm: 'h-9 px-3.5 text-xs rounded-lg',
        lg: 'h-12 px-8 text-base rounded-xl',
        xl: 'h-14 px-10 text-lg rounded-xl',
        '2xl': 'h-16 px-12 text-xl rounded-2xl',
        icon: 'h-11 w-11 rounded-xl',
        'icon-sm': 'h-9 w-9 rounded-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }