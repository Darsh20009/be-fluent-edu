import assert from 'node:assert/strict'
import test from 'node:test'
import {
  getCountryByIso,
  getCountryOptions,
  toInternationalPhone,
} from '../lib/phone-countries'

test('country options cover international regions without duplicate ISO codes', () => {
  const countries = getCountryOptions('en')
  const isoCodes = countries.map((country) => country.iso2)
  assert.ok(countries.length > 240)
  assert.equal(new Set(isoCodes).size, countries.length)
  assert.ok(countries.some((country) => country.iso2 === 'EG'))
})

test('calling-code exceptions use usable international prefixes', () => {
  const byIso = new Map(getCountryOptions('en').map((country) => [country.iso2, country.dialCode]))
  assert.equal(byIso.get('EG'), '+20')
  assert.equal(byIso.get('AQ'), '+672')
  assert.equal(byIso.get('HM'), '+672')
  assert.equal(byIso.get('AC'), '+247')
  assert.equal(byIso.get('SH'), '+290')
  assert.equal(byIso.get('TA'), '+290')
  assert.equal(byIso.get('VA'), '+39')
  assert.equal(byIso.get('AX'), '+358')
  assert.equal(byIso.get('SJ'), '+47')
  assert.equal(byIso.get('UM'), '+1')
  assert.equal(byIso.get('KZ'), '+7')
  assert.equal(byIso.get('RU'), '+7')
})

test('country labels are localized for Arabic and English search', () => {
  const englishEgypt = getCountryOptions('en').find((country) => country.iso2 === 'EG')
  const arabicEgypt = getCountryOptions('ar').find((country) => country.iso2 === 'EG')
  assert.equal(englishEgypt?.englishName, 'Egypt')
  assert.ok(arabicEgypt?.name)
  assert.notEqual(arabicEgypt?.name, 'EG')
})

test('normalizes Egyptian local numbers and Arabic-Indic digits', () => {
  const egypt = getCountryByIso('EG')
  assert.equal(toInternationalPhone('010 1234 5678', egypt), '+201012345678')
  assert.equal(toInternationalPhone('٠١٠١٢٣٤٥٦٧٨', egypt), '+201012345678')
  assert.equal(toInternationalPhone('+20 10 1234 5678', egypt), '+201012345678')
  assert.equal(toInternationalPhone('010 1234 5678', getCountryByIso('EG')), '+201012345678')
})

test('normalizes international trunk zeros and shared North American codes', () => {
  assert.equal(
    toInternationalPhone('+44 (0)20 7123 4567', getCountryByIso('GB')),
    '+442071234567',
  )
  assert.equal(
    toInternationalPhone('202 555 0123', getCountryByIso('US')),
    '+12025550123',
  )
  assert.equal(
    toInternationalPhone('555 1234', getCountryByIso('BS')),
    '+12425551234',
  )
})

test('rejects invalid Egyptian mobile numbers and out-of-range international numbers', () => {
  assert.equal(toInternationalPhone('1234567', getCountryByIso('EG')), '')
  assert.equal(toInternationalPhone('123456', getCountryByIso('US')), '')
  assert.equal(toInternationalPhone('1234567890123456', getCountryByIso('GB')), '')
})