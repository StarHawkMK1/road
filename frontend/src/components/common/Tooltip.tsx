import { ReactNode, useState, useRef, HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface TooltipProps extends Omit<HTMLAttributes<HTMLDivElement>, 'content'> {
  content: ReactNode
  children: ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
  delay?: number
  disabled?: boolean
  arrow?: boolean
  maxWidth?: string
}

const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(
  ({
    content,
    children,
    position = 'top',
    delay = 500,
    disabled = false,
    arrow = true,
    maxWidth = '200px',
    className,
    ...props
  }, ref) => {
    const [isVisible, setIsVisible] = useState(false)
    const timeoutRef = useRef<number>()
    const containerRef = useRef<HTMLDivElement>(null)

    const showTooltip = () => {
      if (disabled) return
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      
      timeoutRef.current = setTimeout(() => {
        setIsVisible(true)
      }, delay)
    }

    const hideTooltip = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      setIsVisible(false)
    }

    const positionClasses = {
      top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
      bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
      left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
      right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
    }

    const arrowClasses = {
      top: 'top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-light-panel dark:border-t-dark-panel',
      bottom: 'bottom-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-light-panel dark:border-b-dark-panel',
      left: 'left-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-light-panel dark:border-l-dark-panel',
      right: 'right-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-light-panel dark:border-r-dark-panel'
    }

    return (
      <div
        ref={containerRef}
        className="relative inline-block"
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        {...props}
      >
        {children}
        
        {isVisible && content && (
          <div
            ref={ref}
            className={cn(
              'absolute z-50 px-3 py-2 text-sm text-light-primary dark:text-dark-primary',
              'bg-light-panel dark:bg-dark-panel border border-light-border dark:border-dark-border',
              'rounded-lg shadow-lg whitespace-nowrap',
              'animate-fade-in',
              positionClasses[position],
              className
            )}
            style={{ maxWidth }}
            role="tooltip"
          >
            {content}
            
            {arrow && (
              <div
                className={cn(
                  'absolute w-0 h-0 border-4',
                  arrowClasses[position]
                )}
              />
            )}
          </div>
        )}
      </div>
    )
  }
)

Tooltip.displayName = 'Tooltip'

// Simple text tooltip for common use cases
export interface SimpleTooltipProps extends Omit<TooltipProps, 'content'> {
  text: string
}

export const SimpleTooltip = forwardRef<HTMLDivElement, SimpleTooltipProps>(
  ({ text, ...props }, ref) => {
    return (
      <Tooltip ref={ref} content={text} {...props} />
    )
  }
)

SimpleTooltip.displayName = 'SimpleTooltip'

// Rich tooltip with title and description
export interface RichTooltipProps extends Omit<TooltipProps, 'content'> {
  title: string
  description?: string
  icon?: ReactNode
}

export const RichTooltip = forwardRef<HTMLDivElement, RichTooltipProps>(
  ({ title, description, icon, ...props }, ref) => {
    const content = (
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          {icon && <span>{icon}</span>}
          <span className="font-semibold">{title}</span>
        </div>
        {description && (
          <p className="text-xs text-light-secondary dark:text-dark-secondary">
            {description}
          </p>
        )}
      </div>
    )

    return (
      <Tooltip ref={ref} content={content} maxWidth="300px" {...props} />
    )
  }
)

RichTooltip.displayName = 'RichTooltip'

export default Tooltip 