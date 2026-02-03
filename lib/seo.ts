import { Metadata } from 'next';

const siteUrl = process.env.NEXTAUTH_URL || 'https://befluent-edu.online';
const siteName = 'Be Fluent';
const siteDescription = 'منصة Be Fluent التعليمية - تعلم اللغة الإنجليزية بطلاقة مع حصص تفاعلية مباشرة، معلمين محترفين، ومتابعة يومية. ابدأ رحلتك نحو الطلاقة الآن!';

export const defaultMetadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Be Fluent | منصة تعلم الإنجليزية الاحترافية - حصص مباشرة ومعلمين محترفين',
    template: '%s | Be Fluent - تعلم الإنجليزية'
  },
  description: siteDescription,
  keywords: [
    'تعلم الإنجليزية',
    'تعلم الانجليزية اونلاين',
    'كورس إنجليزي',
    'حصص إنجليزي أونلاين',
    'Be Fluent',
    'بي فلونت',
    'تعلم اللغة الإنجليزية',
    'دروس انجليزي مباشرة',
    'معلم انجليزي خاص',
    'English learning',
    'online English courses',
    'live English classes',
    'learn English online',
    'English fluency',
    'interactive English lessons',
    'English speaking practice',
    'تحسين النطق الإنجليزي',
    'قواعد اللغة الإنجليزية',
    'محادثة إنجليزية',
    'اختبار تحديد المستوى',
    'كورسات انجليزي للمبتدئين',
    'تعلم الانجليزية من الصفر',
    'منصة تعليمية',
    'befluent-edu.online'
  ],
  authors: [{ name: 'Be Fluent Team', url: siteUrl }],
  creator: 'Be Fluent',
  publisher: 'Be Fluent',
  applicationName: 'Be Fluent',
  generator: 'Next.js',
  referrer: 'origin-when-cross-origin',
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'ar_EG',
    alternateLocale: ['en_US', 'ar_SA'],
    url: siteUrl,
    siteName: siteName,
    title: 'Be Fluent | منصة تعلم الإنجليزية الاحترافية',
    description: siteDescription,
    images: [
      {
        url: `${siteUrl}/icons/icon-512x512.png`,
        width: 512,
        height: 512,
        alt: 'Be Fluent - تعلم الإنجليزية بطلاقة',
        type: 'image/png',
      },
      {
        url: `${siteUrl}/logo.png`,
        width: 200,
        height: 200,
        alt: 'Be Fluent Logo',
        type: 'image/png',
      },
    ],
    countryName: 'Egypt',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@befluent_edu',
    creator: '@befluent_edu',
    title: 'Be Fluent | منصة تعلم الإنجليزية الاحترافية',
    description: siteDescription,
    images: {
      url: `${siteUrl}/icons/icon-512x512.png`,
      alt: 'Be Fluent - تعلم الإنجليزية بطلاقة',
    },
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
    shortcut: '/logo.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Be Fluent',
    startupImage: '/apple-touch-icon.png',
  },
  formatDetection: {
    telephone: true,
    date: true,
    address: true,
    email: true,
    url: true,
  },
  category: 'education',
  classification: 'English Learning Platform',
  verification: {
    google: 'google-site-verification-code',
  },
  alternates: {
    canonical: siteUrl,
    languages: {
      'ar-EG': siteUrl,
      'en-US': `${siteUrl}/en`,
    },
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'Be Fluent',
    'application-name': 'Be Fluent',
    'msapplication-TileColor': '#10B981',
    'msapplication-TileImage': '/icons/icon-192x192.png',
    'msapplication-config': '/browserconfig.xml',
    'theme-color': '#10B981',
    'format-detection': 'telephone=yes',
    'og:locale:alternate': 'en_US',
    'geo.region': 'EG',
    'geo.placename': 'Egypt',
    'content-language': 'ar',
  },
};

export const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  '@id': `${siteUrl}/#organization`,
  name: 'Be Fluent',
  alternateName: ['بي فلونت', 'تعلم الإنجليزية بطلاقة'],
  url: siteUrl,
  logo: {
    '@type': 'ImageObject',
    url: `${siteUrl}/logo.png`,
    width: 512,
    height: 512,
  },
  image: `${siteUrl}/icons/icon-512x512.png`,
  description: siteDescription,
  slogan: 'Fluency Comes First',
  foundingDate: '2024',
  areaServed: {
    '@type': 'Country',
    name: 'Egypt',
  },
  serviceType: ['English Language Learning', 'Online Education', 'Live Classes'],
  sameAs: [
    'https://www.facebook.com/befluent.edu',
    'https://www.instagram.com/befluent.edu',
    'https://wa.me/201091515594',
  ],
  contactPoint: [
    {
      '@type': 'ContactPoint',
      telephone: '+201091515594',
      contactType: 'customer service',
      availableLanguage: ['Arabic', 'English'],
      areaServed: 'EG',
    },
  ],
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'EG',
  },
};

export const courseJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Course',
  '@id': `${siteUrl}/#course`,
  name: 'تعلم الإنجليزية بطلاقة مع Be Fluent',
  description: 'كورس شامل لتعلم اللغة الإنجليزية من الصفر حتى الاحتراف مع حصص تفاعلية مباشرة ومعلمين محترفين',
  url: siteUrl,
  provider: {
    '@type': 'EducationalOrganization',
    name: 'Be Fluent',
    url: siteUrl,
  },
  hasCourseInstance: [
    {
      '@type': 'CourseInstance',
      courseMode: 'online',
      courseWorkload: 'PT2H',
      instructor: {
        '@type': 'Person',
        name: 'Be Fluent Professional Teachers',
      },
    },
  ],
  offers: {
    '@type': 'Offer',
    category: 'Subscription',
    priceCurrency: 'EGP',
    availability: 'https://schema.org/InStock',
  },
  inLanguage: ['en', 'ar'],
  educationalLevel: ['Beginner', 'Intermediate', 'Advanced'],
  teaches: [
    'English Speaking',
    'English Grammar',
    'English Vocabulary',
    'English Listening',
    'English Writing',
  ],
  audience: {
    '@type': 'EducationalAudience',
    educationalRole: 'student',
    audienceType: 'Arabic speakers learning English',
  },
};

export const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${siteUrl}/#website`,
  url: siteUrl,
  name: 'Be Fluent',
  description: siteDescription,
  publisher: {
    '@id': `${siteUrl}/#organization`,
  },
  inLanguage: ['ar', 'en'],
  potentialAction: {
    '@type': 'SearchAction',
    target: `${siteUrl}/search?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
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
        text: 'يمكنك التسجيل مجانًا من خلال صفحة التسجيل على befluent-edu.online وإنشاء حساب جديد بخطوات بسيطة.',
      },
    },
    {
      '@type': 'Question',
      name: 'ما هي مميزات الحصص المباشرة في Be Fluent؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'الحصص المباشرة تتيح لك التفاعل مباشرة مع المعلم والطلاب الآخرين في بيئة تعليمية تفاعلية، مع إمكانية المشاركة الصوتية والكتابية وتلقي ملاحظات فورية.',
      },
    },
    {
      '@type': 'Question',
      name: 'هل يوجد اختبار تحديد مستوى؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'نعم، نوفر اختبار تحديد مستوى مجاني لتحديد مستواك الحالي في اللغة الإنجليزية واقتراح الباقة المناسبة لك.',
      },
    },
    {
      '@type': 'Question',
      name: 'ما هي أسعار الباقات في Be Fluent؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'نوفر باقات متنوعة تبدأ من الباقة الشهرية بـ 8 حصص، والباقة الفصلية بـ 24 حصة، والباقة النصف سنوية بـ 48 حصة. يمكنك الاطلاع على تفاصيل الأسعار في صفحة الباقات.',
      },
    },
    {
      '@type': 'Question',
      name: 'هل يمكنني الحصول على شهادة بعد إتمام الكورس؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'نعم، نوفر شهادات معتمدة عند إتمام كل مستوى تعليمي تؤهلك للعمل والدراسة.',
      },
    },
  ],
};

export const breadcrumbJsonLd = (items: { name: string; url: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
});
