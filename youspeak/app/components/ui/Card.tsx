'use client'

import { ReactNode } from 'react'

interface CardProps {
  variant?: 'default' | 'outlined' | 'elevated'
  className?: string
  children: ReactNode
}

export default function Card({ variant = 'default', className = '', children }: CardProps) {
  const variants = {
    default: 'bg-white rounded-lg shadow p-4 border border-gray-200',
    outlined: 'bg-white rounded-lg border-2 border-gray-200 p-4',
    elevated: 'bg-white rounded-lg shadow-lg p-4 border-2 border-gray-200'
  }

  return (
    <div className={`${variants[variant]} ${className}`}>
      {children}
    </div>
  )
}
