/**
 * Country calling-code data adapted from REST Countries
 * (github.com/mledoze/countries), licensed under ODbL 1.0:
 * https://opendatacommons.org/licenses/odbl/1-0/
 *
 * Names are resolved through the browser's localized region-name data.
 */
export type CountryDialCode = {
  iso2: string
  dialCode: string
}

export type CountryOption = CountryDialCode & {
  name: string
  englishName: string
  flag: string
}

const COUNTRY_DIAL_CODES: CountryDialCode[] = ([
  ['AC', '+247'], ['AD', '+376'], ['AE', '+971'], ['AF', '+93'], ['AG', '+1268'], ['AI', '+1264'],
  ['AL', '+355'], ['AM', '+374'], ['AO', '+244'], ['AQ', '+672'], ['AR', '+54'],
  ['AS', '+1684'], ['AT', '+43'], ['AU', '+61'], ['AW', '+297'], ['AX', '+358'],
  ['AZ', '+994'], ['BA', '+387'], ['BB', '+1246'], ['BD', '+880'], ['BE', '+32'],
  ['BF', '+226'], ['BG', '+359'], ['BH', '+973'], ['BI', '+257'], ['BJ', '+229'],
  ['BL', '+590'], ['BM', '+1441'], ['BN', '+673'], ['BO', '+591'], ['BQ', '+599'],
  ['BR', '+55'], ['BS', '+1242'], ['BT', '+975'], ['BW', '+267'], ['BY', '+375'],
  ['BZ', '+501'], ['CA', '+1'], ['CC', '+61'], ['CD', '+243'], ['CF', '+236'],
  ['CG', '+242'], ['CH', '+41'], ['CI', '+225'], ['CK', '+682'], ['CL', '+56'],
  ['CM', '+237'], ['CN', '+86'], ['CO', '+57'], ['CR', '+506'], ['CU', '+53'],
  ['CV', '+238'], ['CW', '+599'], ['CX', '+61'], ['CY', '+357'], ['CZ', '+420'],
  ['DE', '+49'], ['DJ', '+253'], ['DK', '+45'], ['DM', '+1767'], ['DO', '+1'],
  ['DZ', '+213'], ['EC', '+593'], ['EE', '+372'], ['EG', '+20'], ['EH', '+212'],
  ['ER', '+291'], ['ES', '+34'], ['ET', '+251'], ['FI', '+358'], ['FJ', '+679'],
  ['FK', '+500'], ['FM', '+691'], ['FO', '+298'], ['FR', '+33'], ['GA', '+241'],
  ['GB', '+44'], ['GD', '+1473'], ['GE', '+995'], ['GF', '+594'], ['GG', '+44'],
  ['GH', '+233'], ['GI', '+350'], ['GL', '+299'], ['GM', '+220'], ['GN', '+224'],
  ['GP', '+590'], ['GQ', '+240'], ['GR', '+30'], ['GS', '+500'], ['GT', '+502'],
  ['GU', '+1671'], ['GW', '+245'], ['GY', '+592'], ['HK', '+852'], ['HM', '+672'],
  ['HN', '+504'], ['HR', '+385'], ['HT', '+509'], ['HU', '+36'], ['ID', '+62'],
  ['IE', '+353'], ['IL', '+972'], ['IM', '+44'], ['IN', '+91'], ['IO', '+246'],
  ['IQ', '+964'], ['IR', '+98'], ['IS', '+354'], ['IT', '+39'], ['JE', '+44'],
  ['JM', '+1876'], ['JO', '+962'], ['JP', '+81'], ['KE', '+254'], ['KG', '+996'],
  ['KH', '+855'], ['KI', '+686'], ['KM', '+269'], ['KN', '+1869'], ['KP', '+850'],
  ['KR', '+82'], ['KW', '+965'], ['KY', '+1345'], ['KZ', '+7'], ['LA', '+856'],
  ['LB', '+961'], ['LC', '+1758'], ['LI', '+423'], ['LK', '+94'], ['LR', '+231'],
  ['LS', '+266'], ['LT', '+370'], ['LU', '+352'], ['LV', '+371'], ['LY', '+218'],
  ['MA', '+212'], ['MC', '+377'], ['MD', '+373'], ['ME', '+382'], ['MF', '+590'],
  ['MG', '+261'], ['MH', '+692'], ['MK', '+389'], ['ML', '+223'], ['MM', '+95'],
  ['MN', '+976'], ['MO', '+853'], ['MP', '+1670'], ['MQ', '+596'], ['MR', '+222'],
  ['MS', '+1664'], ['MT', '+356'], ['MU', '+230'], ['MV', '+960'], ['MW', '+265'],
  ['MX', '+52'], ['MY', '+60'], ['MZ', '+258'], ['NA', '+264'], ['NC', '+687'],
  ['NE', '+227'], ['NF', '+672'], ['NG', '+234'], ['NI', '+505'], ['NL', '+31'],
  ['NO', '+47'], ['NP', '+977'], ['NR', '+674'], ['NU', '+683'], ['NZ', '+64'],
  ['OM', '+968'], ['PA', '+507'], ['PE', '+51'], ['PF', '+689'], ['PG', '+675'],
  ['PH', '+63'], ['PK', '+92'], ['PL', '+48'], ['PM', '+508'], ['PN', '+64'],
  ['PR', '+1'], ['PS', '+970'], ['PT', '+351'], ['PW', '+680'], ['PY', '+595'],
  ['QA', '+974'], ['RE', '+262'], ['RO', '+40'], ['RS', '+381'], ['RU', '+7'],
  ['RW', '+250'], ['SA', '+966'], ['SB', '+677'], ['SC', '+248'], ['SD', '+249'],
  ['SE', '+46'], ['SG', '+65'], ['SH', '+290'], ['SI', '+386'], ['SJ', '+47'],
  ['SK', '+421'], ['SL', '+232'], ['SM', '+378'], ['SN', '+221'], ['SO', '+252'],
  ['SR', '+597'], ['SS', '+211'], ['ST', '+239'], ['SV', '+503'], ['SX', '+1721'],
  ['SY', '+963'], ['SZ', '+268'], ['TA', '+290'], ['TC', '+1649'], ['TD', '+235'], ['TF', '+262'],
  ['TG', '+228'], ['TH', '+66'], ['TJ', '+992'], ['TK', '+690'], ['TL', '+670'],
  ['TM', '+993'], ['TN', '+216'], ['TO', '+676'], ['TR', '+90'], ['TT', '+1868'],
  ['TV', '+688'], ['TW', '+886'], ['TZ', '+255'], ['UA', '+380'], ['UG', '+256'],
  ['UM', '+1'], ['US', '+1'], ['UY', '+598'], ['UZ', '+998'], ['VA', '+39'],
  ['VC', '+1784'], ['VE', '+58'], ['VG', '+1284'], ['VI', '+1340'], ['VN', '+84'],
  ['VU', '+678'], ['WF', '+681'], ['WS', '+685'], ['XK', '+383'], ['YE', '+967'],
  ['YT', '+262'], ['ZA', '+27'], ['ZM', '+260'], ['ZW', '+263'],
] as const).map(([iso2, dialCode]) => ({ iso2, dialCode }))

const flagForRegion = (iso2: string) =>
  [...iso2.toUpperCase()]
    .map((letter) => String.fromCodePoint(127397 + letter.charCodeAt(0)))
    .join('')

const displayRegion = (displayNames: Intl.DisplayNames, iso2: string) => {
  try {
    return displayNames.of(iso2) || iso2
  } catch {
    return iso2
  }
}

export function getCountryOptions(language: 'ar' | 'en'): CountryOption[] {
  const localizedNames = new Intl.DisplayNames([language], { type: 'region' })
  const englishNames = new Intl.DisplayNames(['en'], { type: 'region' })
  const collator = new Intl.Collator(language, { sensitivity: 'base' })
  const specialNames: Record<string, { ar: string; en: string }> = {
    AC: { ar: 'جزيرة أسينشين', en: 'Ascension Island' },
    SH: { ar: 'سانت هيلينا', en: 'Saint Helena' },
    TA: { ar: 'تريستان دا كونا', en: 'Tristan da Cunha' },
  }

  return COUNTRY_DIAL_CODES
    .map(({ iso2, dialCode }) => {
      const specialName = specialNames[iso2]
      return {
        iso2,
        dialCode,
        name: specialName?.[language] || displayRegion(localizedNames, iso2),
        englishName: specialName?.en || displayRegion(englishNames, iso2),
        flag: iso2 === 'AC' || iso2 === 'TA' ? flagForRegion('GB') : flagForRegion(iso2),
      }
    })
    .sort((a, b) => collator.compare(a.name, b.name))
}

export function getCountryByIso(iso2: string): CountryDialCode {
  return COUNTRY_DIAL_CODES.find((country) => country.iso2 === iso2) || COUNTRY_DIAL_CODES.find((country) => country.iso2 === 'EG')!
}

export function formatDialCode(dialCode: string): string {
  return dialCode.startsWith('+1') && dialCode.length > 2
    ? `+1 ${dialCode.slice(2)}`
    : dialCode
}

export function toAsciiDigits(value: string): string {
  return value
    .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 0x06f0))
}

export function toInternationalPhone(value: string, country: CountryDialCode): string {
  const cleanedValue = toAsciiDigits(value.trim())
  const compact = cleanedValue.replace(/[()\s.-]/g, '')
  if (!compact) return ''

  const countryDigits = country.dialCode.slice(1)
  const stripSelectedTrunkZero = (digits: string) =>
    country.iso2 !== 'IT' &&
    country.iso2 !== 'VA' &&
    digits.startsWith(countryDigits) &&
    digits.charAt(countryDigits.length) === '0'
      ? `${digits.slice(0, countryDigits.length)}${digits.slice(countryDigits.length + 1)}`
      : digits

  let international: string
  if (compact.startsWith('+')) {
    international = `+${stripSelectedTrunkZero(compact.slice(1).replace(/\D/g, ''))}`
  } else if (compact.startsWith('00')) {
    international = `+${stripSelectedTrunkZero(compact.slice(2).replace(/\D/g, ''))}`
  } else {
    let nationalDigits = compact.replace(/\D/g, '')

    if (nationalDigits.startsWith(countryDigits) && nationalDigits.length >= countryDigits.length + 7) {
      international = `+${stripSelectedTrunkZero(nationalDigits)}`
    } else if (
      country.dialCode.startsWith('+1') &&
      country.dialCode.length > 2 &&
      nationalDigits.startsWith(country.dialCode.slice(2)) &&
      nationalDigits.length >= 10
    ) {
      international = `+1${nationalDigits}`
    } else {
      if (nationalDigits.startsWith('0') && country.iso2 !== 'IT' && country.iso2 !== 'VA') {
        nationalDigits = nationalDigits.replace(/^0+/, '')
      }
      international = `${country.dialCode}${nationalDigits}`
    }
  }

  const digitCount = international.replace(/\D/g, '').length
  if (!/^\+[1-9]\d{7,14}$/.test(international) || digitCount < 8 || digitCount > 15) return ''
  if (country.iso2 === 'EG' && !/^\+20(?:10|11|12|15)\d{8}$/.test(international)) return ''
  return international
}