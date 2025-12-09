'use client'

import { ReactNode } from 'react'

interface AlertProps {
  variant?: 'info' | 'success' | 'error' | 'warning'
  children: ReactNode
}

export default function Alert({ variant = 'info', children }: AlertProps) {
  const variants = {
    info: 'bg-blue-50 border-l-4 border-blue-500 p-4 text-blue-700',
    success: 'bg-green-50 border-l-4 border-green-500 p-4 text-green-700',
    error: 'bg-red-50 border-l-4 border-red-500 p-4 text-red-700',
    warning: 'bg-yellow-50 border-l-4 border-yellow-500 p-4 text-yellow-700'
  }

  return (
    <div className={`${variants[variant]} rounded`}>
      {children}
    </div>
  )
}
