import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface LoadingProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'spinner' | 'dots' | 'pulse'
  text?: string
  center?: boolean
}

const Loading = forwardRef<HTMLDivElement, LoadingProps>(
  ({ 
    className,
    size = 'md',
    variant = 'spinner',
    text,
    center = false,
    ...props 
  }, ref) => {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-6 h-6',
      lg: 'w-8 h-8'
    }

    const textSizeClasses = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg'
    }

    const renderSpinner = () => (
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-light-border dark:border-dark-border',
          'border-t-light-accent dark:border-t-dark-accent',
          sizeClasses[size]
        )}
      />
    )

    const renderDots = () => (
      <div className="flex space-x-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              'rounded-full bg-light-accent dark:bg-dark-accent animate-bounce',
              size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : 'w-4 h-4'
            )}
            style={{
              animationDelay: `${i * 0.2}s`,
              animationDuration: '1s'
            }}
          />
        ))}
      </div>
    )

    const renderPulse = () => (
      <div
        className={cn(
          'rounded-full bg-light-accent dark:bg-dark-accent animate-pulse',
          sizeClasses[size]
        )}
      />
    )

    const renderLoader = () => {
      switch (variant) {
        case 'dots':
          return renderDots()
        case 'pulse':
          return renderPulse()
        default:
          return renderSpinner()
      }
    }

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center space-x-3',
          center && 'justify-center',
          className
        )}
        {...props}
      >
        {renderLoader()}
        {text && (
          <span className={cn(
            'text-light-secondary dark:text-dark-secondary',
            textSizeClasses[size]
          )}>
            {text}
          </span>
        )}
      </div>
    )
  }
)

Loading.displayName = 'Loading'

// Loading Overlay component for full screen loading
export interface LoadingOverlayProps extends HTMLAttributes<HTMLDivElement> {
  isVisible: boolean
  text?: string
  variant?: 'spinner' | 'dots' | 'pulse'
}

export const LoadingOverlay = forwardRef<HTMLDivElement, LoadingOverlayProps>(
  ({ 
    isVisible, 
    text = 'Loading...', 
    variant = 'spinner',
    className,
    ...props 
  }, ref) => {
    if (!isVisible) return null

    return (
      <div
        ref={ref}
        className={cn(
          'fixed inset-0 z-50 flex items-center justify-center',
          'bg-light-bg dark:bg-dark-bg bg-opacity-80 dark:bg-opacity-80',
          className
        )}
        {...props}
      >
        <div className="flex flex-col items-center space-y-4">
          <Loading variant={variant} size="lg" />
          <p className="text-lg text-light-primary dark:text-dark-primary">
            {text}
          </p>
        </div>
      </div>
    )
  }
)

LoadingOverlay.displayName = 'LoadingOverlay'

export default Loading 