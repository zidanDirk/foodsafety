// components/ui/Card.tsx
'use client'

import React from 'react'
import { cn } from '@/lib/utils'

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  description?: string
  variant?: 'default' | 'elevated' | 'outline' | 'filled'
  hover?: boolean
}

const CardComponent = React.forwardRef<HTMLDivElement, CardProps>(
  ({ 
    className, 
    variant = 'default',
    hover = true,
    title, 
    description, 
    children, 
    ...props 
  }, ref) => {
    const baseClasses = 'rounded-lg overflow-hidden transition-all duration-300'
    
    const variantClasses = {
      default: 'bg-white shadow-md hover:shadow-lg',
      elevated: 'bg-white shadow-lg hover:shadow-xl',
      outline: 'bg-white border border-gray-200 hover:shadow-md',
      filled: 'bg-gray-50 border border-gray-200',
    }
    
    const hoverClass = hover ? 'hover:-translate-y-1' : ''
    
    const classes = cn(
      baseClasses,
      variantClasses[variant],
      hoverClass,
      className
    )

    return (
      <div
        ref={ref}
        className={classes}
        {...props}
      >
        {(title || description) && (
          <div className="px-6 py-4 border-b border-gray-100">
            {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
            {description && <p className="mt-1 text-gray-600">{description}</p>}
          </div>
        )}
        <div className="p-6">
          {children}
        </div>
      </div>
    )
  }
)
CardComponent.displayName = 'Card'

// Wrap with React.memo for performance optimization
const Card = React.memo(CardComponent)

export { Card }