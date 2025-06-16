import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  dot?: boolean
  removable?: boolean
  onRemove?: () => void
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ 
    className,
    variant = 'default',
    size = 'md',
    dot = false,
    removable = false,
    onRemove,
    children,
    ...props 
  }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-full'
    
    const variantClasses = {
      default: 'bg-light-muted dark:bg-dark-muted text-light-primary dark:text-dark-primary',
      success: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
      warning: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
      danger: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
      info: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
      outline: 'border border-light-border dark:border-dark-border text-light-primary dark:text-dark-primary'
    }
    
    const sizeClasses = {
      sm: dot ? 'w-2 h-2' : 'px-2 py-0.5 text-xs',
      md: dot ? 'w-3 h-3' : 'px-2.5 py-1 text-sm',
      lg: dot ? 'w-4 h-4' : 'px-3 py-1.5 text-base'
    }

    return (
      <span
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          dot && 'rounded-full',
          className
        )}
        {...props}
      >
        {!dot && children}
        
        {removable && onRemove && (
          <button
            onClick={onRemove}
            className="ml-1 hover:bg-black hover:bg-opacity-20 rounded-full p-0.5 transition-colors"
            aria-label="Remove badge"
          >
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </span>
    )
  }
)

Badge.displayName = 'Badge'

// Status Badge component for common status indicators
export interface StatusBadgeProps extends Omit<BadgeProps, 'variant'> {
  status: 'online' | 'offline' | 'away' | 'busy' | 'active' | 'inactive' | 'pending' | 'completed' | 'failed'
}

export const StatusBadge = forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ status, ...props }, ref) => {
    const statusVariants = {
      online: 'success',
      active: 'success',
      completed: 'success',
      offline: 'default',
      inactive: 'default',
      away: 'warning',
      pending: 'warning',
      busy: 'danger',
      failed: 'danger'
    } as const

    const statusLabels = {
      online: 'Online',
      offline: 'Offline',
      away: 'Away',
      busy: 'Busy',
      active: 'Active',
      inactive: 'Inactive',
      pending: 'Pending',
      completed: 'Completed',
      failed: 'Failed'
    }

    return (
      <Badge
        ref={ref}
        variant={statusVariants[status]}
        {...props}
      >
        {statusLabels[status]}
      </Badge>
    )
  }
)

StatusBadge.displayName = 'StatusBadge'

// Count Badge component for notification counts
export interface CountBadgeProps extends Omit<BadgeProps, 'children'> {
  count: number
  max?: number
  showZero?: boolean
}

export const CountBadge = forwardRef<HTMLSpanElement, CountBadgeProps>(
  ({ count, max = 99, showZero = false, ...props }, ref) => {
    if (count === 0 && !showZero) return null

    const displayCount = count > max ? `${max}+` : count.toString()

    return (
      <Badge ref={ref} variant="danger" size="sm" {...props}>
        {displayCount}
      </Badge>
    )
  }
)

CountBadge.displayName = 'CountBadge'

export default Badge 