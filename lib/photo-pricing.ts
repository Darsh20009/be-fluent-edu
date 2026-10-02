import type { SubscriptionType } from '@prisma/client'

export type PhotoPackage = {
  title: string
  titleAr: string
  description: string
  descriptionAr: string
  subscriptionType: SubscriptionType
  capacity: number
  durationDays: number
  lessonsCount: number
  lessonsPerWeek: number
  price: number
  discountPrice: number | null
  currency: 'EGP'
  isActive: true
  featuresJson: string
}

const pricing = [
  { key: 'duo-month', title: 'Semi-private · 1 month', titleAr: 'شبه خاص · شهر', type: 'DUO', capacity: 2, months: 1, days: 30, price: 1350, discount: null },
  { key: 'duo-quarter', title: 'Semi-private · 3 months', titleAr: 'شبه خاص · ٣ أشهر', type: 'DUO', capacity: 2, months: 3, days: 90, price: 4050, discount: 2880 },
  { key: 'duo-half-year', title: 'Semi-private · 6 months', titleAr: 'شبه خاص · ٦ أشهر', type: 'DUO', capacity: 2, months: 6, days: 180, price: 8100, discount: 4200 },
  { key: 'small-month', title: 'Small group · 1 month', titleAr: 'مجموعة صغيرة · شهر', type: 'SMALL_GROUP', capacity: 3, months: 1, days: 30, price: 2700, discount: null },
  { key: 'small-quarter', title: 'Small group · 3 months', titleAr: 'مجموعة صغيرة · ٣ أشهر', type: 'SMALL_GROUP', capacity: 3, months: 3, days: 90, price: 8100, discount: 6000 },
  { key: 'small-half-year', title: 'Small group · 6 months', titleAr: 'مجموعة صغيرة · ٦ أشهر', type: 'SMALL_GROUP', capacity: 3, months: 6, days: 180, price: 16200, discount: 10350 },
] as const

export function buildPhotoPricing(lessonsPerWeek: number): PhotoPackage[] {
  if (!Number.isInteger(lessonsPerWeek) || lessonsPerWeek < 1 || lessonsPerWeek > 7) {
    throw new Error('Lessons per week must be an integer from 1 to 7')
  }

  return pricing.map((item) => {
    const lessonsCount = lessonsPerWeek * item.months * 4
    const capacityText = item.type === 'DUO'
      ? 'Two students per group'
      : 'Two to three students per group'
    return {
      title: item.title,
      titleAr: item.titleAr,
      description: `Price per student. ${capacityText}.`,
      descriptionAr: `السعر لكل طالب. ${item.type === 'DUO' ? 'طالبان في المجموعة.' : 'من طالبين إلى ثلاثة في المجموعة.'}`,
      subscriptionType: item.type,
      capacity: item.capacity,
      durationDays: item.days,
      lessonsCount,
      lessonsPerWeek,
      price: item.price,
      discountPrice: item.discount,
      currency: 'EGP',
      isActive: true,
      featuresJson: JSON.stringify([
        `Price per student · EGP ${item.discount ?? item.price}`,
        `${lessonsCount} lessons total`,
        capacityText,
        'Group placement requires admin approval',
      ]),
    }
  })
}