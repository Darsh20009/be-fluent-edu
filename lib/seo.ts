import { Metadata } from 'next';

const siteUrl = process.env.NEXTAUTH_URL || 'https://befluent.com';

export const defaultMetadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Be Fluent - تعلم الإنجليزية بطلاقة',
    template: '%s | Be Fluent'
  },
  description: 'منصة احترافية لتعلم اللغة الإنجليزية مع حصص تفاعلية مباشرة ومتابعة يومية. ابدأ رحلتك نحو الطلاقة مع Be Fluent.',
  keywords: [
    'تعلم الإنجليزية',
    'كورس إنجليزي',
    'حصص إنجليزي أونلاين',
    'Be Fluent',
    'تعلم اللغة الإنجليزية',
    'English learning',
    'online English courses',
    'live English classes',
    'learn English online',
    'English fluency',
    'interactive English'
  ],
  authors: [{ name: 'Be Fluent Team' }],
  creator: 'Be Fluent',
  publisher: 'Be Fluent',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'ar_EG',
    alternateLocale: 'en_US',
    url: siteUrl,
    siteName: 'Be Fluent',
    title: 'Be Fluent - تعلم الإنجليزية بطلاقة',
    description: 'منصة احترافية لتعلم اللغة الإنجليزية مع حصص تفاعلية مباشرة',
    images: [
      {
        url: '/icons/icon-512x512.png',
        width: 512,
        height: 512,
        alt: 'Be Fluent Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Be Fluent - تعلم الإنجليزية بطلاقة',
    description: 'منصة احترافية لتعلم اللغة الإنجليزية مع حصص تفاعلية مباشرة',
    images: ['/icons/icon-512x512.png'],
    creator: '@befluent',
  },
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Be Fluent',
  },
  formatDetection: {
    telephone: true,
    date: true,
    address: true,
    email: true,
  },
  category: 'education',
  classification: 'English Learning Platform',
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'Be Fluent',
    'application-name': 'Be Fluent',
    'msapplication-TileColor': '#10B981',
    'msapplication-TileImage': '/icons/icon-192x192.png',
    'theme-color': '#10B981',
  },
};

export const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  name: 'Be Fluent',
  alternateName: 'تعلم الإنجليزية بطلاقة',
  url: siteUrl,
  logo: `${siteUrl}/icons/icon-512x512.png`,
  description: 'منصة احترافية لتعلم اللغة الإنجليزية مع حصص تفاعلية مباشرة ومتابعة يومية',
  sameAs: [],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    availableLanguage: ['Arabic', 'English'],
  },
};

export const courseJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Course',
  name: 'تعلم الإنجليزية بطلاقة مع Be Fluent',
  description: 'كورس شامل لتعلم اللغة الإنجليزية من الصفر حتى الاحتراف مع حصص تفاعلية مباشرة',
  provider: {
    '@type': 'EducationalOrganization',
    name: 'Be Fluent',
    url: siteUrl,
  },
  hasCourseInstance: {
    '@type': 'CourseInstance',
    courseMode: 'online',
    instructor: {
      '@type': 'Person',
      name: 'Be Fluent Team',
    },
  },
  inLanguage: ['en', 'ar'],
  educationalLevel: 'All Levels',
};

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'كيف يمكنني التسجيل في Be Fluent؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'يمكنك التسجيل مجانًا من خلال صفحة التسجيل وإنشاء حساب جديد.',
      },
    },
    {
      '@type': 'Question',
      name: 'ما هي مميزات الحصص المباشرة؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'الحصص المباشرة تتيح لك التفاعل مباشرة مع المعلم والطلاب الآخرين في بيئة تعليمية تفاعلية.',
      },
    },
  ],
};
