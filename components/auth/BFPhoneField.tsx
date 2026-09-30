'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import {
  formatDialCode,
  getCountryOptions,
  type CountryOption,
} from '@/lib/phone-countries'

type Props = {
  id: string
  value: string
  countryIso: string
  language: 'ar' | 'en'
  disabled?: boolean
  placeholder?: string
  onChange: (value: string) => void
  onCountryChange: (iso2: string) => void
}

export default function BFPhoneField({
  id,
  value,
  countryIso,
  language,
  disabled = false,
  placeholder,
  onChange,
  onCountryChange,
}: Props) {
  const isArabic = language === 'ar'
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const pickerRef = useRef<HTMLButtonElement>(null)
  const countries = useMemo(() => getCountryOptions(language), [language])
  const selected = countries.find((country) => country.iso2 === countryIso) || countries.find((country) => country.iso2 === 'EG')!

  const filteredCountries = useMemo(() => {
    const term = query.trim().toLocaleLowerCase(language)
    if (!term) return countries
    const digits = term.replace(/\D/g, '')
    return countries.filter((country) =>
      country.name.toLocaleLowerCase(language).includes(term) ||
      country.englishName.toLocaleLowerCase('en').includes(term) ||
      (digits.length > 0 && country.dialCode.replace(/\D/g, '').includes(digits)),
    )
  }, [countries, language, query])

  useEffect(() => {
    if (!open) return
    searchRef.current?.focus()
    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (event.target instanceof Node && !containerRef.current?.contains(event.target)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('pointerdown', closeOnOutsidePointer)
    return () => document.removeEventListener('pointerdown', closeOnOutsidePointer)
  }, [open])

  const chooseCountry = (country: CountryOption) => {
    onCountryChange(country.iso2)
    setOpen(false)
    setQuery('')
    pickerRef.current?.focus()
  }

  return (
    <div
      ref={containerRef}
      className="relative flex min-h-12 flex-row items-stretch border border-[#dce4dc] focus-within:border-[#24714f] focus-within:ring-2 focus-within:ring-[#24714f]/15"
      dir="ltr"
      onKeyDown={(event) => {
        if (event.key === 'Escape' && open) {
          event.preventDefault()
          event.stopPropagation()
          setOpen(false)
          setQuery('')
          pickerRef.current?.focus()
        }
      }}
    >
      <div className="relative shrink-0">
        <button
          ref={pickerRef}
          type="button"
          aria-label={`${isArabic ? 'اختر الدولة' : 'Choose country'}: ${selected.name} ${formatDialCode(selected.dialCode)}`}
          aria-haspopup="listbox"
          aria-expanded={open}
          disabled={disabled}
          data-testid="button-country-picker"
          onClick={() => setOpen((current) => !current)}
          className="flex h-full min-h-12 items-center gap-2 border-r border-[#e4e9e4] px-3 text-sm font-semibold text-[#405047] disabled:opacity-60"
        >
          <span className="text-lg leading-none" aria-hidden="true">{selected.flag}</span>
          <span>{formatDialCode(selected.dialCode)}</span>
          <ChevronDown size={14} className="text-[#7c867f]" aria-hidden="true" />
        </button>

        {open && (
          <div
            className="absolute left-0 top-full z-[120] mt-2 w-[min(19rem,calc(100vw-2.5rem))] border border-[#dce4dc] bg-white shadow-lg"
            dir="ltr"
          >
            <label className="flex min-h-11 items-center gap-2 border-b border-[#e4e9e4] px-3">
              <Search size={15} className="shrink-0 text-[#7c867f]" aria-hidden="true" />
              <input
                ref={searchRef}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') event.preventDefault()
                }}
                placeholder={isArabic ? 'ابحث بالعربية أو الإنجليزية أو الرمز' : 'Search country or calling code'}
                aria-label={isArabic ? 'ابحث عن دولة أو رمز اتصال' : 'Search countries or calling codes'}
                data-testid="input-country-search"
                dir="auto"
                className="min-w-0 flex-1 bg-transparent text-sm text-[#202a25] outline-none placeholder:text-[#929c95]"
              />
            </label>
            <div role="listbox" aria-label={isArabic ? 'الدول ورموز الاتصال' : 'Countries and calling codes'} className="max-h-[min(52dvh,19rem)] overflow-y-auto py-1">
              {filteredCountries.length ? filteredCountries.map((country) => (
                <button
                  key={country.iso2}
                  type="button"
                  role="option"
                  aria-selected={country.iso2 === selected.iso2}
                  data-testid={`option-country-${country.iso2.toLowerCase()}`}
                  onClick={() => chooseCountry(country)}
                  className="flex min-h-11 w-full items-center gap-3 px-3 text-left text-sm hover:bg-[#f4f7f3] focus:bg-[#f4f7f3] focus:outline-none"
                >
                  <span className="text-lg leading-none" aria-hidden="true">{country.flag}</span>
                  <span className="min-w-0 flex-1 truncate" dir={isArabic ? 'rtl' : 'ltr'}>
                    {isArabic ? country.name : country.englishName}
                  </span>
                  <span className="shrink-0 text-xs font-semibold text-[#526157]">{formatDialCode(country.dialCode)}</span>
                </button>
              )) : (
                <p className="px-3 py-4 text-sm text-[#68746c]" role="status">
                  {isArabic ? 'لا توجد دولة بهذا البحث.' : 'No countries match that search.'}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <input
        id={id}
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        dir="ltr"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        data-testid={`input-phone-${id}`}
        className="min-h-12 min-w-0 flex-1 bg-transparent px-3 text-sm text-[#202a25] outline-none placeholder:text-[#9aa49d]"
      />
    </div>
  )
}