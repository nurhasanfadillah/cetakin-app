interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
}

export default function LoadingSpinner({ size = 'md', text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-14 h-14 border-4'
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`
        ${sizeClasses[size]}
        border-primary border-t-transparent rounded-full animate-spin
      `} />
      {text && <p className="text-text-secondary text-sm">{text}</p>}
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <LoadingSpinner size="lg" text="Memuat..." />
    </div>
  )
}

export function InlineLoader({ text }: { text?: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      {text && <span className="text-sm text-text-secondary">{text}</span>}
    </div>
  )
}