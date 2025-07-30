// components/ui/LoadingSpinner.tsx
'use client'

import React from 'react'
import { cn } from '@/lib/utils'

export interface LoadingSpinnerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'primary' | 'secondary' | 'success' | 'destructive'
  className?: string
}

const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ 
    className, 
    variant = 'primary',
    size = 'md', 
    ...props 
  }, ref) => {
    const variantClasses = {
      primary: 'border-blue-600 border-r-transparent',
      secondary: 'border-gray-600 border-r-transparent',
      success: 'border-green-600 border-r-transparent',
      destructive: 'border-red-600 border-r-transparent',
    }
    
    const sizeClasses = {
      sm: 'h-4 w-4',
      md: 'h-8 w-8',
      lg: 'h-12 w-12',
      xl: 'h-16 w-16',
    }
    
    const classes = cn(
      'animate-spin rounded-full border-4 border-solid',
      variantClasses[variant],
      sizeClasses[size],
      className
    )

    return (
      <div
        ref={ref}
        className={cn('flex items-center justify-center', className)}
        {...props}
      >
        <div className={classes} />
      </div>
    )
  }
)
LoadingSpinner.displayName = 'LoadingSpinner'

export { LoadingSpinner }