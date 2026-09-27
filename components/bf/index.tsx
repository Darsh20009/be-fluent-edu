import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TableHTMLAttributes,
} from 'react'

const baseControl =
  'min-h-11 w-full rounded-lg border border-[#e1dfe7] bg-white px-3 py-2 text-[#252238] outline-none transition focus-visible:border-[#12805e] focus-visible:ring-2 focus-visible:ring-[#12805e]/20 aria-[invalid=true]:border-[#a43c42] aria-[invalid=true]:focus-visible:ring-[#a43c42]/20 disabled:cursor-not-allowed disabled:opacity-60'

export function BFButton({
  variant = 'primary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
}) {
  const variants = {
    primary: 'bg-[#12805e] text-white hover:bg-[#0e6a4e]',
    secondary: 'border border-[#e1dfe7] bg-[#f4f1f8] text-[#4b3a70] hover:bg-[#ebe6f2]',
    ghost: 'bg-transparent text-[#4b3a70] hover:bg-[#f4f1f8]',
    danger: 'bg-[#a43c42] text-white hover:bg-[#873238]',
  }

  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#12805e] disabled:cursor-not-allowed disabled:opacity-55 ${variants[variant]} ${className}`}
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
      className={`rounded-xl border border-[#e5e3e9] bg-white p-5 ${className}`}
      {...props}
    />
  )
}

export function BFModal({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean
  title: string
  children: ReactNode
  onClose?: () => void
}) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#14231f]/35 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.()
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') onClose?.()
      }}
    >
      <section
        aria-modal="true"
        aria-labelledby="bf-modal-title"
        className="w-full max-w-lg rounded-xl border border-[#e5e3e9] bg-white p-6"
        role="dialog"
        tabIndex={-1}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <h2 id="bf-modal-title" className="text-lg font-bold text-[#1e2927]">
            {title}
          </h2>
          {onClose ? (
            <BFButton
              aria-label="Close dialog"
              variant="ghost"
              className="min-h-8 px-2 py-1"
              onClick={onClose}
              type="button"
            >
              ×
            </BFButton>
          ) : null}
        </div>
        {children}
      </section>
    </div>
  )
}

export function BFInput({
  className = '',
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${baseControl} ${className}`} {...props} />
}

export function BFSelect({
  className = '',
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={`${baseControl} ${className}`} {...props} />
}

export function BFBadge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode
  tone?: 'neutral' | 'success' | 'warning' | 'danger'
}) {
  const tones = {
    neutral: 'bg-[#f1eff4] text-[#514b62]',
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

export function BFTable({
  className = '',
  ...props
}: TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="max-w-full overflow-x-auto rounded-xl border border-[#e5e3e9]">
      <table className={`w-full min-w-[36rem] border-collapse text-sm ${className}`} {...props} />
    </div>
  )
}

export function BFTabs({
  children,
  label = 'Sections',
}: {
  children: ReactNode
  label?: string
}) {
  return (
    <div aria-label={label} className="flex max-w-full flex-wrap gap-1 rounded-lg bg-[#f1eff4] p-1" role="tablist">
      {children}
    </div>
  )
}

export function BFDrawer({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean
  title: string
  children: ReactNode
  onClose?: () => void
}) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-40 bg-[#252238]/30"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.()
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') onClose?.()
      }}
    >
      <aside
        aria-label={title}
        aria-modal="true"
        className="absolute inset-y-0 end-0 w-full max-w-md overflow-y-auto border-s border-[#e5e3e9] bg-white p-6"
        role="dialog"
        tabIndex={-1}
      >
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-lg font-bold">{title}</h2>
          {onClose ? (
            <BFButton type="button" variant="ghost" onClick={onClose}>
              Close
            </BFButton>
          ) : null}
        </div>
        {children}
      </aside>
    </div>
  )
}

export function BFToast({
  children,
  tone = 'neutral',
}: {
  children: ReactNode
  tone?: 'neutral' | 'success' | 'warning' | 'danger'
}) {
  return (
    <div aria-live="polite" className="rounded-lg border border-[#e5e3e9] bg-white px-4 py-3 text-sm" role={tone === 'danger' ? 'alert' : 'status'}>
      <BFBadge tone={tone}>{children}</BFBadge>
    </div>
  )
}

export function BFTooltip({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <span title={label} className="inline-flex">
      {children}
    </span>
  )
}

export function BFHelp({ children }: { children: ReactNode }) {
  return <p className="mt-1 text-xs leading-5 text-[#66756f]">{children}</p>
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
    <div className="rounded-xl border border-dashed border-[#d6d3dc] bg-[#fcfbfd] p-8 text-center">
      <h3 className="font-semibold text-[#252238]">{title}</h3>
      {description ? <p className="mt-2 text-sm text-[#687080]">{description}</p> : null}
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
    <div className="rounded-xl border border-[#f0d3d4] bg-[#fff8f7] p-6" role="alert">
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
    <header className="flex flex-col justify-between gap-4 border-b border-[#e5e3e9] pb-5 sm:flex-row sm:items-end">
      <div>
        <h1 className="text-2xl font-bold text-[#252238]">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-sm text-[#687080]">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </header>
  )
}

export function BFProgress({
  value,
  max = 100,
  label,
}: {
  value: number
  max?: number
  label?: string
}) {
  const safeMax = Number.isFinite(max) && max > 0 ? max : 100
  const safeValue = Number.isFinite(value) ? Math.min(safeMax, Math.max(0, value)) : 0
  const percentage = (safeValue / safeMax) * 100
  return (
    <div>
      {label ? <div className="mb-1 text-xs text-[#687080]">{label}</div> : null}
      <div aria-label={label || 'Progress'} aria-valuemax={safeMax} aria-valuemin={0} aria-valuenow={safeValue} className="h-2 overflow-hidden rounded-full bg-[#ecebf0]" role="progressbar">
        <div className="h-full rounded-full bg-[#12805e] transition-[width]" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  )
}

export function BFAvatar({
  name,
  src,
}: {
  name: string
  src?: string
}) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')

  return src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={name} className="h-10 w-10 rounded-full object-cover" src={src} />
  ) : (
    <span aria-label={name} className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#e8f5ef] text-sm font-bold text-[#116b4f]" role="img">
      {initials || '?'}
    </span>
  )
}
