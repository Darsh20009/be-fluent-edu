import type { CSSProperties, ReactNode } from 'react'
import styles from './BrandLockup.module.css'

type BrandSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
type BrandLockupProps = {
  size?: BrandSize
  tone?: 'dark' | 'light'
  tagline?: ReactNode
  className?: string
  markClassName?: string
  animated?: boolean
  priority?: boolean
}

const BRAND_NAME = 'Be Fluent'
const BRAND_CHARACTERS = Array.from(BRAND_NAME)
const sizeClasses: Record<BrandSize, { mark: number; name: string; tagline: string }> = {
  xs: { mark: 28, name: 'text-sm', tagline: 'text-[9px]' },
  sm: { mark: 36, name: 'text-base sm:text-lg', tagline: 'text-[9px]' },
  md: { mark: 44, name: 'text-lg sm:text-xl', tagline: 'text-[10px]' },
  lg: { mark: 64, name: 'text-3xl sm:text-4xl', tagline: 'text-[11px]' },
  xl: { mark: 88, name: 'text-4xl sm:text-5xl', tagline: 'text-xs' },
}

export default function BrandLockup({
  size = 'sm',
  tone = 'dark',
  tagline,
  className = '',
  markClassName = '',
  animated = true,
}: BrandLockupProps) {
  const sizeClass = sizeClasses[size]
  const markWidth = Math.round(sizeClass.mark * 316 / 340)
  const nameColor = tone === 'light' ? 'text-white' : 'text-[#24342b]'
  const taglineColor = tone === 'light' ? 'text-white/70' : 'text-[#68746c]'

  return (
    <span className={`inline-flex min-w-0 items-center gap-2.5 ${className}`} dir="ltr">
      <img
        src="/__mockup/images/be-fluent-mark-2026.png"
        alt=""
        aria-hidden="true"
        width={markWidth}
        height={sizeClass.mark}
        style={{ width: `${markWidth}px`, height: `${sizeClass.mark}px` }}
        className={`shrink-0 object-contain ${markClassName}`}
      />
      <span className="min-w-0">
        <span
          className={`block whitespace-nowrap font-bold leading-tight tracking-tight ${sizeClass.name} ${nameColor}`}
          lang="en"
          dir="ltr"
        >
          <span className="sr-only">{BRAND_NAME}</span>
          <span aria-hidden="true" className={animated ? styles.wordmark : styles.staticWordmark}>
            {BRAND_CHARACTERS.map((character, index) => (
              <span
                key={`${character}-${index}`}
                className={styles.character}
                style={{ '--brand-char-delay': `${index * 75}ms` } as CSSProperties}
              >
                {character === ' ' ? '\u00a0' : character}
              </span>
            ))}
          </span>
        </span>
        {tagline && (
          <span className={`mt-0.5 block truncate ${sizeClass.tagline} ${taglineColor}`} dir="auto">
            {tagline}
          </span>
        )}
      </span>
    </span>
  )
}