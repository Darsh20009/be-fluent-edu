'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight, Search } from 'lucide-react'
import { GUIDE_GROUPS, getScreenshotPath, TIPS_REGISTRY, type GuideEntry, type GuideGroup } from '@/lib/tips/registry'
import type { TipsReadiness } from '@/lib/tips/readiness'
import styles from './tips.module.css'

type Language = 'ar' | 'en'

const GROUP_LABELS: Record<GuideGroup, { en: string; ar: string }> = {
  public: { en: 'Public & access', ar: 'الواجهة العامة والوصول' },
  student: { en: 'Student journey', ar: 'رحلة الطالب' },
  teacher: { en: 'Teacher workspace', ar: 'مساحة المدرس' },
  admin: { en: 'Administration', ar: 'الإدارة' },
}

const FILTER_LABELS = {
  all: { en: 'All pages', ar: 'كل الصفحات' },
  public: GROUP_LABELS.public,
  student: GROUP_LABELS.student,
  teacher: GROUP_LABELS.teacher,
  admin: GROUP_LABELS.admin,
} as const

const txt = (language: Language, en: string, ar: string) => language === 'ar' ? ar : en

function searchableContent(entry: GuideEntry) {
  return [
    entry.slug, entry.route, entry.title.en, entry.title.ar,
    entry.purpose.en, entry.purpose.ar,
    ...entry.instructions.en, ...entry.instructions.ar,
    entry.permissions.en, entry.permissions.ar,
    entry.integrations.en, entry.integrations.ar,
    entry.connects.en, entry.connects.ar,
  ].join(' ').toLocaleLowerCase()
}

function GuideCard({ entry, language, available }: { entry: GuideEntry; language: Language; available: ReadonlySet<string> }) {
  const screenshot = getScreenshotPath(entry.slug, available)
  const title = entry.title[language]
  const pageLabel = txt(language, 'Open page', 'فتح الصفحة')
  return (
    <details className={styles.guide} data-testid={`guide-${entry.slug}`}>
      <summary>
        <span className={styles.guideTitle}>
          <strong>{title}</strong>
          <span dir="ltr">{entry.route}</span>
        </span>
        <span className={styles.tag}>{txt(language, entry.group, ({ public: 'عام', student: 'طالب', teacher: 'مدرس', admin: 'إدارة' })[entry.group])}</span>
      </summary>
      <div className={styles.guideBody}>
        <div>
          <div className={styles.copyGrid}>
            <section className={styles.copyBlock}>
              <h3>{txt(language, 'PURPOSE', 'الغرض')}</h3>
              <p>{entry.purpose[language]}</p>
            </section>
            <section className={styles.copyBlock}>
              <h3>{txt(language, 'HOW TO USE', 'طريقة الاستخدام')}</h3>
              <ul>{entry.instructions[language].map((step, index) => <li key={`${entry.slug}-step-${index}`}>{step}</li>)}</ul>
            </section>
            <section className={styles.copyBlock}>
              <h3>{txt(language, 'ACCESS & PERMISSIONS', 'الوصول والصلاحيات')}</h3>
              <p>{entry.permissions[language]}</p>
            </section>
            <section className={styles.copyBlock}>
              <h3>{txt(language, 'INTEGRATIONS', 'التكاملات')}</h3>
              <p>{entry.integrations[language]}</p>
            </section>
            <section className={styles.copyBlock}>
              <h3>{txt(language, 'HOW IT CONNECTS', 'ارتباطها بالمسار')}</h3>
              <p>{entry.connects[language]}</p>
            </section>
          </div>
          <Link className={styles.routeLink} href={entry.linkRoute || entry.route} data-testid={`link-guide-route-${entry.slug}`}>
            {pageLabel}<ArrowUpRight size={15} aria-hidden="true" />
          </Link>
        </div>
        <figure className={styles.shot}>
          {screenshot ? (
            <Image src={screenshot} alt={txt(language, `${title} page screenshot`, `لقطة شاشة لصفحة ${title}`)} width={1000} height={560} sizes="(max-width: 760px) 100vw, 40vw" />
          ) : (
            <div className={styles.shotPlaceholder} role="status" aria-label={txt(language, 'Screenshot not captured yet', 'لم تُلتقط لقطة الشاشة بعد')}>
              <div>
                <strong>{txt(language, 'Screenshot not captured yet', 'لم تُلتقط لقطة الشاشة بعد')}</strong>
                <span>{txt(language, 'A real signed-in capture will be added here when available.', 'ستظهر هنا لقطة حقيقية بعد التقاطها من جلسة مسجلة الدخول.')}</span>
              </div>
            </div>
          )}
          <figcaption className={styles.shotCaption}>
            <span>{txt(language, 'Page reference', 'مرجع الصفحة')}</span>
            <span dir="ltr">{screenshot ? `${entry.slug}.png` : `tips/screens/${entry.slug}.png`}</span>
          </figcaption>
        </figure>
      </div>
    </details>
  )
}

export default function TipsGuide({ language, screenshotSlugs, readiness }: { language: string; screenshotSlugs: string[]; readiness: TipsReadiness }) {
  const activeLanguage: Language = language === 'ar' ? 'ar' : 'en'
  const [query, setQuery] = useState('')
  const [groupFilter, setGroupFilter] = useState<GuideGroup | 'all'>('all')
  const available = useMemo(() => new Set(screenshotSlugs), [screenshotSlugs])
  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase()
    return TIPS_REGISTRY.filter(entry =>
      (groupFilter === 'all' || entry.group === groupFilter) &&
      (!term || searchableContent(entry).includes(term)),
    )
  }, [query, groupFilter])
  const capturedCount = TIPS_REGISTRY.filter(entry => available.has(entry.slug)).length
  const direction = activeLanguage === 'ar' ? 'rtl' : 'ltr'
  const yesNo = (value: boolean) => txt(activeLanguage, value ? 'Present' : 'Missing', value ? 'موجود' : 'غير موجود')
  const dataPing = readiness.databasePingHealthy === true
    ? txt(activeLanguage, 'Ping healthy', 'فحص الاتصال ناجح')
    : readiness.databasePingHealthy === false
      ? txt(activeLanguage, 'Ping unavailable', 'فشل فحص الاتصال')
      : txt(activeLanguage, 'Not checked', 'لم يتم الفحص')
  const dbStatusReady = readiness.databasePingHealthy === true
  const qmeetConfigured = readiness.qmeetBasePresent && readiness.qmeetKeyPresent

  return (
    <div className={styles.page} dir={direction}>
      <section className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>{txt(activeLanguage, 'BE FLUENT · ADMIN FIELD GUIDE', 'BE FLUENT · دليل الإدارة')}</p>
          <h2 className={styles.title}>{txt(activeLanguage, 'One learning journey. Clear ownership at every step.', 'رحلة تعلم واحدة، ومسؤولية واضحة في كل خطوة.')}</h2>
          <p className={styles.intro}>
            {txt(activeLanguage,
              'A bilingual, read-only guide to the real routes and dashboard tabs. Each page explains its purpose, use, access boundary, integration dependencies and place in the learning flow.',
              'دليل ثنائي اللغة للصفحات والتبويبات الفعلية. يوضح غرض كل صفحة وطريقة استخدامها وحدود الوصول واعتماديات التكامل وموقعها ضمن مسار التعلم.') }
          </p>
        </div>
        <div className={styles.metric} aria-label={txt(activeLanguage, `${TIPS_REGISTRY.length} pages documented`, `تم توثيق ${TIPS_REGISTRY.length} صفحة`)}>
          <strong>{TIPS_REGISTRY.length}</strong>
          <span>{txt(activeLanguage, 'pages documented', 'صفحة موثقة')}</span>
        </div>
      </section>

      <section className={styles.journey} aria-label={txt(activeLanguage, 'Student learning flow', 'مسار تعلم الطالب')}>
        {[
          ['01', 'Level & goals', 'المستوى والأهداف'],
          ['02', 'Class', 'الحصة'],
          ['03', 'Feedback', 'الملاحظات'],
          ['04', 'Homework', 'الواجب'],
          ['05', 'Progress', 'التقدم'],
        ].map(([number, en, ar]) => (
          <div className={styles.journeyStep} key={number}>
            <span>{txt(activeLanguage, `STEP ${number}`, `الخطوة ${number}`)}</span>
            <strong>{txt(activeLanguage, en, ar)}</strong>
          </div>
        ))}
      </section>

      <section className={styles.integrationPanel} aria-labelledby="tips-integrations-heading">
        <div className={styles.integrationPanelHeading}>
          <div>
            <h2 id="tips-integrations-heading">{txt(activeLanguage, 'Current service readiness', 'جاهزية الخدمات الحالية')}</h2>
            <p>{txt(activeLanguage, 'Server-checked presence only. Provider credentials and errors are never shown.', 'فحص وجود الإعدادات من الخادم فقط. لا تُعرض بيانات الاعتماد أو أخطاء المزود.')}</p>
          </div>
          <span>{txt(activeLanguage, 'Updated on page request', 'محدّث عند طلب الصفحة')}</span>
        </div>
        <div className={styles.integrationGrid}>
          <section className={styles.integrationItem} data-testid="integration-readiness-database">
            <div className={styles.integrationHeader}>
              <strong>{txt(activeLanguage, 'Application database', 'قاعدة بيانات التطبيق')}</strong>
              <span className={`${styles.integrationState} ${dbStatusReady ? styles.configured : styles.incomplete}`}>{dataPing}</span>
            </div>
            <p>{txt(activeLanguage, 'Phase 5 database-backed mode', 'وضع قاعدة بيانات المرحلة الخامسة')}: {readiness.databaseGateEnabled ? txt(activeLanguage, 'enabled', 'مفعّل') : txt(activeLanguage, 'not enabled', 'غير مفعّل')}</p>
            <p>{txt(activeLanguage, 'Database connection configured', 'اتصال قاعدة البيانات')}: {yesNo(readiness.databaseConfigured)}</p>
          </section>
          <section className={styles.integrationItem} data-testid="integration-readiness-qmeet">
            <div className={styles.integrationHeader}>
              <strong>QMeet</strong>
              <span className={`${styles.integrationState} ${qmeetConfigured ? styles.configured : styles.incomplete}`}>{qmeetConfigured ? txt(activeLanguage, 'Configuration complete', 'الإعداد مكتمل') : txt(activeLanguage, 'Configuration incomplete', 'الإعداد غير مكتمل')}</span>
            </div>
            <p dir="ltr">QMEET_API_BASE_URL: {yesNo(readiness.qmeetBasePresent)}</p>
            <p dir="ltr">QMEET_API_KEY: {yesNo(readiness.qmeetKeyPresent)}</p>
            <p>{txt(activeLanguage, 'Configuration only; no live provider check.', 'فحص إعداد فقط؛ لم يُختبر المزود مباشرة.')}</p>
          </section>
          <section className={styles.integrationItem} data-testid="integration-readiness-thanarah">
            <div className={styles.integrationHeader}>
              <strong>Thanarah AI</strong>
              <span className={`${styles.integrationState} ${readiness.thanarahKeyPresent ? styles.configured : styles.incomplete}`}>{yesNo(readiness.thanarahKeyPresent)}</span>
            </div>
            <p dir="ltr">THANARAH_API_KEY: {yesNo(readiness.thanarahKeyPresent)}</p>
            <p>{txt(activeLanguage, 'Key presence only; no AI request was sent.', 'تم فحص وجود المفتاح فقط؛ لم يُرسل طلب ذكاء اصطناعي.')}</p>
          </section>
          <section className={styles.integrationItem} data-testid="integration-readiness-email">
            <div className={styles.integrationHeader}>
              <strong>{txt(activeLanguage, 'Email delivery', 'إرسال البريد')}</strong>
              <span className={`${styles.integrationState} ${readiness.emailConfigured ? styles.configured : styles.incomplete}`}>{readiness.emailConfigured ? txt(activeLanguage, 'Configured', 'مُعدّ') : txt(activeLanguage, 'Not configured', 'غير مُعدّ')}</span>
            </div>
            <p>{txt(activeLanguage, 'Email provider configuration only; delivery was not tested.', 'فحص إعداد مزود البريد فقط؛ لم يُختبر الإرسال.')}</p>
          </section>
        </div>
      </section>

      <div className={styles.toolbar}>
        <label className={styles.searchWrap}>
          <Search className={styles.searchIcon} aria-hidden="true" />
          <span className="sr-only">{txt(activeLanguage, 'Search the guide', 'ابحث في الدليل')}</span>
          <input
            className={styles.search}
            type="search"
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder={txt(activeLanguage, 'Search pages, permissions, flows…', 'ابحث عن الصفحات أو الصلاحيات أو المسارات…')}
            data-testid="input-tips-search"
          />
        </label>
        <div className={styles.filters} role="group" aria-label={txt(activeLanguage, 'Filter page groups', 'تصفية مجموعات الصفحات')}>
          {(['all', ...GUIDE_GROUPS] as const).map(group => (
            <button
              key={group}
              type="button"
              className={`${styles.filter} ${groupFilter === group ? styles.filterActive : ''}`}
              aria-pressed={groupFilter === group}
              onClick={() => setGroupFilter(group)}
              data-testid={`filter-tips-${group}`}
            >
              {FILTER_LABELS[group][activeLanguage]}
            </button>
          ))}
        </div>
      </div>

      {filtered.length ? GUIDE_GROUPS.map(group => {
        const entries = filtered.filter(entry => entry.group === group)
        if (!entries.length) return null
        return (
          <section className={styles.group} key={group} aria-labelledby={`tips-group-${group}`}>
            <h2 className={styles.groupHeading} id={`tips-group-${group}`}>
              {GROUP_LABELS[group][activeLanguage]}<span>{entries.length}</span>
            </h2>
            <div className={styles.guideList}>
              {entries.map(entry => <GuideCard key={entry.slug} entry={entry} language={activeLanguage} available={available} />)}
            </div>
          </section>
        )
      }) : (
        <div className={styles.empty} role="status" data-testid="status-tips-no-results">
          <strong>{txt(activeLanguage, 'No matching pages', 'لا توجد صفحات مطابقة')}</strong>
          {txt(activeLanguage, 'Try another term or clear the group filter.', 'جرّب كلمة أخرى أو أزل تصفية المجموعة.')}
        </div>
      )}

      <aside className={styles.note}>
        <strong>{txt(activeLanguage, 'Integration status is intentionally cautious.', 'حالة التكاملات موضحة بتحفّظ.')}</strong>{' '}
        {txt(activeLanguage,
          `Only the database ping above checks live connectivity. QMeet, WhatsApp, email, AI, payment, uploads and live rooms still depend on configured services, credentials, consent or storage; a present key is not a provider health check. Screenshots captured: ${capturedCount} of ${TIPS_REGISTRY.length}.`,
          `فحص اتصال قاعدة البيانات أعلاه هو اختبار الاتصال المباشر الوحيد. تظل QMeet وWhatsApp والبريد والذكاء الاصطناعي والدفع والرفع والغرف المباشرة معتمدة على خدمات واعتمادات وموافقة أو تخزين مضبوط؛ وجود المفتاح ليس فحصًا لصحة المزود. لقطات الشاشة المتاحة: ${capturedCount} من ${TIPS_REGISTRY.length}.`)}
      </aside>
    </div>
  )
}