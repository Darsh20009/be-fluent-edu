import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react'

export function BFButton({
  variant = 'primary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
}) {
  const variants = {
    primary: 'bg-[#24714f] text-white hover:bg-[#1d5f42]',
    secondary: 'border border-[#e0e6e1] bg-[#f3f6f3] text-[#355944] hover:bg-[#eaf1eb]',
    ghost: 'bg-transparent text-[#355944] hover:bg-[#f3f6f3]',
    danger: 'bg-[#a43c42] text-white hover:bg-[#873238]',
  }

  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center rounded-md px-4 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#24714f] disabled:cursor-not-allowed disabled:opacity-55 ${variants[variant]} ${className}`}
      {...props}
    />
  )
}

export function BFCard({
  className = '',
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-lg border border-[#e0e6e1] bg-white p-5 ${className}`}
      {...props}
    />
  )
}

export function BFBadge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode
  tone?: 'neutral' | 'success' | 'warning' | 'danger'
}) {
  const tones = {
    neutral: 'bg-[#f0f3f0] text-[#536158]',
    success: 'bg-[#e8f5ef] text-[#116b4f]',
    warning: 'bg-[#fbf2dd] text-[#715620]',
    danger: 'bg-[#fbebea] text-[#8f3338]',
  }

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  )
}

export function BFEmptyState({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="rounded-lg border border-dashed border-[#d5ddd6] bg-[#fbfcfa] p-8 text-center">
      <h3 className="font-semibold text-[#202a25]">{title}</h3>
      {description ? <p className="mt-2 text-sm text-[#65716a]">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}

export function BFErrorState({
  title = 'Something went wrong',
  description,
  action,
}: {
  title?: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="rounded-lg border border-[#f0d3d4] bg-[#fff8f7] p-6" role="alert">
      <h3 className="font-semibold text-[#8f3338]">{title}</h3>
      {description ? <p className="mt-2 text-sm text-[#6c4a4a]">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}

export function BFPageHeader({
  title,
  description,
  actions,
}: {
  title: string
  description?: string
  actions?: ReactNode
}) {
  return (
    <header className="flex flex-col justify-between gap-4 border-b border-[#e0e6e1] pb-5 sm:flex-row sm:items-end">
      <div>
        <h1 className="text-2xl font-bold text-[#202a25]">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-sm text-[#65716a]">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </header>
  )
}