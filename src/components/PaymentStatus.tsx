import { CheckCircle2, Clock, XCircle, AlertTriangle } from 'lucide-react'
import type { BadgeVariant } from '@/components/ui/badge'

interface PaymentStatusConfig {
  icon: typeof CheckCircle2
  label: string
  variant: BadgeVariant
}

const paymentStatusConfig: Record<string, PaymentStatusConfig> = {
  UNPAID: {
    icon: Clock,
    label: 'Belum Bayar',
    variant: 'secondary'
  },
  PENDING: {
    icon: Clock,
    label: 'Menunggu',
    variant: 'warning'
  },
  PAID: {
    icon: CheckCircle2,
    label: 'Lunas',
    variant: 'success'
  },
  SUCCESS: {
    icon: CheckCircle2,
    label: 'Berhasil',
    variant: 'success'
  },
  SETTLEMENT: {
    icon: CheckCircle2,
    label: 'Lunas',
    variant: 'success'
  },
  EXPIRED: {
    icon: Clock,
    label: 'Kedaluwarsa',
    variant: 'secondary'
  },
  FAILED: {
    icon: XCircle,
    label: 'Gagal',
    variant: 'destructive'
  },
  DENY: {
    icon: XCircle,
    label: 'Ditolak',
    variant: 'destructive'
  },
  CANCEL: {
    icon: XCircle,
    label: 'Dibatalkan',
    variant: 'destructive'
  },
  REFUND: {
    icon: AlertTriangle,
    label: 'Refund',
    variant: 'warning'
  },
  REFUNDED: {
    icon: AlertTriangle,
    label: 'Dikembalikan',
    variant: 'warning'
  },
}

interface PaymentStatusBadgeProps {
  status: string
  className?: string
}

export function PaymentStatusBadge({ status, className = '' }: PaymentStatusBadgeProps) {
  const config = paymentStatusConfig[status] || {
    icon: Clock,
    label: status,
    variant: 'secondary' as const
  }
  
  const Icon = config.icon
  
  return (
    <span className={`
      inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
      bg-${config.variant === 'success' ? 'success' : config.variant === 'warning' ? 'warning' : config.variant === 'destructive' ? 'danger' : 'surface'}/10
      text-${config.variant === 'success' ? 'success' : config.variant === 'warning' ? 'warning' : config.variant === 'destructive' ? 'danger' : 'text-muted'}
      ${className}
    `}>
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  )
}

interface PaymentStatusDisplayProps {
  status: string
  showIcon?: boolean
  className?: string
}

export function PaymentStatusDisplay({ status, showIcon = true, className = '' }: PaymentStatusDisplayProps) {
  const config = paymentStatusConfig[status] || {
    icon: Clock,
    label: status,
    variant: 'secondary' as const
  }
  
  const Icon = config.icon
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showIcon && <Icon className={`
        w-5 h-5 
        ${config.variant === 'success' ? 'text-success' : ''}
        ${config.variant === 'warning' ? 'text-warning' : ''}
        ${config.variant === 'destructive' ? 'text-danger' : ''}
        ${config.variant === 'secondary' ? 'text-text-muted' : ''}
      `} />}
      <span className={`
        font-medium
        ${config.variant === 'success' ? 'text-success' : ''}
        ${config.variant === 'warning' ? 'text-warning' : ''}
        ${config.variant === 'destructive' ? 'text-danger' : ''}
        ${config.variant === 'secondary' ? 'text-text-secondary' : ''}
      `}>
        {config.label}
      </span>
    </div>
  )
}

export function getPaymentStatusLabel(status: string): string {
  return paymentStatusConfig[status]?.label || status
}

export function getMidtransStatusLabel(status: string): string {
  const midtransLabels: Record<string, string> = {
    'capture': 'Tertangkap',
    'settlement': 'Lunas',
    'pending': 'Menunggu',
    'deny': 'Ditolak',
    'cancel': 'Dibatalkan',
    'expire': 'Kedaluwarsa',
    'refund': 'Refund',
  }
  return midtransLabels[status] || status
}