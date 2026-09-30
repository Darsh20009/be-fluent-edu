import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TableHTMLAttributes,
} from 'react'

const baseControl =
  'min-h-11 w-full rounded-md border border-[#e0e6e1] bg-white px-3 py-2 text-[#202a25] outline-none transition focus-visible:border-[#24714f] focus-visible:ring-2 focus-visible:ring-[#24714f]/20 aria-[invalid=true]:border-[#a43c42] aria-[invalid=true]:focus-visible:ring-[#a43c42]/20 disabled:cursor-not-allowed disabled:opacity-60'

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#17251f]/35 p-4"
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
        className="w-full max-w-lg rounded-lg border border-[#e0e6e1] bg-white p-6"
        role="dialog"
        tabIndex={-1}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <h2 id="bf-modal-title" className="text-lg font-bold text-[#202a25]">
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

export function BFTable({
  className = '',
  ...props
}: TableHTMLAttributes<HTMLTableElement>) {
  return (
      <div className="max-w-full overflow-x-auto rounded-lg border border-[#e0e6e1]">
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
    <div aria-label={label} className="flex max-w-full flex-wrap gap-1 rounded-md bg-[#f0f3f0] p-1" role="tablist">
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
      className="fixed inset-0 z-40 bg-[#17251f]/30"
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
        className="absolute inset-y-0 end-0 w-full max-w-md overflow-y-auto border-s border-[#e0e6e1] bg-white p-6"
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
    <div aria-live="polite" className="rounded-md border border-[#e0e6e1] bg-white px-4 py-3 text-sm" role={tone === 'danger' ? 'alert' : 'status'}>
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
  return <p className="mt-1 text-xs leading-5 text-[#65716a]">{children}</p>
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
      {label ? <div className="mb-1 text-xs text-[#65716a]">{label}</div> : null}
      <div aria-label={label || 'Progress'} aria-valuemax={safeMax} aria-valuemin={0} aria-valuenow={safeValue} className="h-2 overflow-hidden rounded-full bg-[#e8ede8]" role="progressbar">
        <div className="h-full rounded-full bg-[#24714f] transition-[width]" style={{ width: `${percentage}%` }} />
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
    <span aria-label={name} className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#e8f1e9] text-sm font-bold text-[#286547]" role="img">
      {initials || '?'}
    </span>
  )
}

export function BFSection({
  title,
  description,
  actions,
  children,
  className = '',
}: {
  title?: string
  description?: string
  actions?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`space-y-4 ${className}`}>
      {(title || description || actions) && (
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            {title ? <h2 className="text-lg font-semibold text-[#202a25]">{title}</h2> : null}
            {description ? <p className="mt-1 text-sm leading-6 text-[#65716a]">{description}</p> : null}
          </div>
          {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
        </div>
      )}
      {children}
    </section>
  )
}

export function BFStat({
  label,
  value,
  note,
  icon,
}: {
  label: string
  value: ReactNode
  note?: string
  icon?: ReactNode
}) {
  return (
    <div className="flex min-h-24 items-center gap-3 rounded-lg border border-[#e0e6e1] bg-white p-4">
      {icon ? <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-[#edf4ef] text-[#327453]">{icon}</span> : null}
      <div className="min-w-0">
        <p className="text-xs font-medium text-[#65716a]">{label}</p>
        <p className="mt-1 text-xl font-semibold tabular-nums text-[#202a25]">{value}</p>
        {note ? <p className="mt-1 text-xs text-[#7a867f]">{note}</p> : null}
      </div>
    </div>
  )
}

export function BFLoadingState({
  label = 'Loading',
  rows = 3,
}: {
  label?: string
  rows?: number
}) {
  const safeRows = Number.isInteger(rows) ? Math.min(8, Math.max(1, rows)) : 3
  return (
    <div aria-busy="true" aria-label={label} className="space-y-3" role="status">
      <span className="sr-only">{label}</span>
      {Array.from({ length: safeRows }, (_, index) => (
        <div key={index} aria-hidden="true" className="h-14 rounded-md border border-[#e5eae5] bg-[#f1f4f1]" />
      ))}
    </div>
  )
}

export function BFConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  busy = false,
  onConfirm,
  onClose,
}: {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  busy?: boolean
  onConfirm: () => void
  onClose: () => void
}) {
  return (
    <BFModal open={open} title={title} onClose={busy ? undefined : onClose}>
      <p className="text-sm leading-6 text-[#65716a]">{description}</p>
      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <BFButton type="button" variant="secondary" disabled={busy} onClick={onClose}>{cancelLabel}</BFButton>
        <BFButton type="button" variant="danger" disabled={busy} onClick={onConfirm}>{confirmLabel}</BFButton>
      </div>
    </BFModal>
  )
}
