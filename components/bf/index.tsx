import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TableHTMLAttributes,
} from 'react'

const baseControl =
  'rounded-lg border border-[#dfe6e1] bg-white text-[#1e2927] outline-none transition focus:border-[#16835f] focus:ring-2 focus:ring-[#16835f]/15 disabled:cursor-not-allowed disabled:opacity-60'

export function BFButton({
  variant = 'primary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
}) {
  const variants = {
    primary: 'bg-[#16835f] text-white hover:bg-[#116b4d]',
    secondary: 'bg-[#f1f5f2] text-[#174536] hover:bg-[#e7eeea]',
    ghost: 'bg-transparent text-[#174536] hover:bg-[#f1f5f2]',
    danger: 'bg-[#b53d3d] text-white hover:bg-[#983333]',
  }

  return (
    <button
      className={`inline-flex min-h-10 items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition ${variants[variant]} ${className}`}
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
      className={`rounded-xl border border-[#e5e9e5] bg-white p-5 ${className}`}
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
    >
      <section
        aria-modal="true"
        aria-labelledby="bf-modal-title"
        className="w-full max-w-lg rounded-xl border border-[#e5e9e5] bg-white p-6 shadow-xl"
        role="dialog"
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
  return <input className={`${baseControl} w-full px-3 py-2 ${className}`} {...props} />
}

export function BFSelect({
  className = '',
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={`${baseControl} w-full px-3 py-2 ${className}`} {...props} />
}

export function BFBadge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode
  tone?: 'neutral' | 'success' | 'warning' | 'danger'
}) {
  const tones = {
    neutral: 'bg-[#f1f5f2] text-[#40564e]',
    success: 'bg-[#e7f5ed] text-[#17623f]',
    warning: 'bg-[#fff4d9] text-[#785719]',
    danger: 'bg-[#fdeaea] text-[#8c2f2f]',
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
    <div className="overflow-x-auto rounded-xl border border-[#e5e9e5]">
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
    <div aria-label={label} className="flex flex-wrap gap-1 rounded-lg bg-[#f1f5f2] p-1" role="tablist">
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
    <div className="fixed inset-0 z-40 bg-[#14231f]/30" role="presentation">
      <aside
        aria-label={title}
        className="absolute inset-y-0 end-0 w-full max-w-md overflow-y-auto border-s border-[#e5e9e5] bg-white p-6 shadow-xl"
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
    <div aria-live="polite" className="rounded-lg border border-[#e5e9e5] bg-white px-4 py-3 text-sm shadow-sm">
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
    <div className="rounded-xl border border-dashed border-[#cddbd3] bg-[#fbfdfb] p-8 text-center">
      <h3 className="font-semibold text-[#1e2927]">{title}</h3>
      {description ? <p className="mt-2 text-sm text-[#66756f]">{description}</p> : null}
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
    <div className="rounded-xl border border-[#f0cccc] bg-[#fffafa] p-6">
      <h3 className="font-semibold text-[#8c2f2f]">{title}</h3>
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
    <header className="flex flex-col justify-between gap-4 border-b border-[#e5e9e5] pb-5 sm:flex-row sm:items-end">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#1e2927]">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-sm text-[#66756f]">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 gap-2">{actions}</div> : null}
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
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <div>
      {label ? <div className="mb-1 text-xs text-[#66756f]">{label}</div> : null}
      <div aria-label={label} aria-valuemax={max} aria-valuemin={0} aria-valuenow={value} className="h-2 overflow-hidden rounded-full bg-[#e8eee9]" role="progressbar">
        <div className="h-full rounded-full bg-[#16835f] transition-[width]" style={{ width: `${percentage}%` }} />
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
    <span aria-label={name} className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#e7f5ed] text-sm font-bold text-[#17623f]">
      {initials || '?'}
    </span>
  )
}
