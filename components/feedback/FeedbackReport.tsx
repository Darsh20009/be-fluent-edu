'use client'

import { useCallback, useRef } from 'react'
import Image from 'next/image'
import { Printer } from 'lucide-react'
import { localeText } from '@/lib/locale'
import styles from './FeedbackReport.module.css'

type Expression = { expression?: string | null; meaning?: string | null; example?: string | null; category?: string | null }
type Mistake = { original?: string | null; correction?: string | null; explanation?: string | null }
type Pronunciation = { target?: string | null; actual?: string | null; guidance?: string | null; phonetic?: string | null; teacherNote?: string | null }
type Ebi = { betterExpression?: string | null; explanation?: string | null; priority?: string | null }
export type PublicFeedback = {
  id?: string | number
  summary?: string | null
  publishedAt?: string | null
  session?: { title?: string | null; startTime?: string | null; endTime?: string | null } | null
  expressions?: Expression[] | null
  mistakes?: Mistake[] | null
  pronunciation?: Pronunciation[] | null
  ebi?: Ebi[] | null
  studentName?: string | null
  skillRatings?: Array<{ skill?: string | null; name?: string | null; rating?: string | number | null; score?: string | number | null }> | null
}

type Props = { item: PublicFeedback; language: 'ar' | 'en'; reportId: string }
type Category = 'VOCABULARY' | 'IDIOM' | 'SLANG' | 'CHUNK'

const categoryNames: Record<Category, [string, string]> = {
  VOCABULARY: ['مفردات وتعبيرات', 'Vocabulary & expressions'],
  IDIOM: ['تعابير اصطلاحية', 'Idioms'],
  SLANG: ['تعبيرات دارجة', 'Slang'],
  CHUNK: ['تراكيب جاهزة', 'Useful chunks'],
}

function categoryOf(value?: string | null): Category {
  const category = String(value || '').toUpperCase()
  return category in categoryNames ? category as Category : 'VOCABULARY'
}

function prettyDate(value: string | null | undefined, language: 'ar' | 'en') {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.valueOf())) return ''
  return new Intl.DateTimeFormat(language === 'ar' ? 'ar' : 'en', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(date)
}

function Text({ value, className }: { value?: string | null; className?: string }) {
  if (!value?.trim()) return null
  return <span dir="auto" className={className}>{value}</span>
}

export default function FeedbackReport({ item, language, reportId }: Props) {
  const reportRef = useRef<HTMLElement>(null)
  const printReport = useCallback(() => {
    const body = document.body
    const report = reportRef.current
    if (!report) return
    report.classList.add('feedback-report-selected')
    body.classList.add('feedback-report-printing')
    const cleanup = () => {
      body.classList.remove('feedback-report-printing')
      report.classList.remove('feedback-report-selected')
    }
    window.addEventListener('afterprint', cleanup, { once: true })
    window.print()
    window.setTimeout(cleanup, 1500)
  }, [])

  const expressions = item.expressions || []
  const mistakes = item.mistakes || []
  const pronunciation = item.pronunciation || []
  const ebi = item.ebi || []
  const date = prettyDate(item.session?.startTime || item.publishedAt, language)
  const hasRatings = Boolean(item.skillRatings?.length)
  const label = (ar: string, en: string) => localeText(language, ar, en)
  const ratingsLabel = (rating?: string | number | null, score?: string | number | null) => {
    const value = rating ?? score
    return value === undefined || value === null || value === '' ? '' : String(value)
  }

  return (
    <article ref={reportRef} id={reportId} className={`${styles.report} ${styles.printRoot}`} data-testid={`feedback-report-${reportId}`}>
      <div className={styles.masthead}>
        <div className={styles.brand}>
          <Image src="/brand/be-fluent-mark-2026.png" alt="" width={42} height={42} priority />
          <div>
            <div className={styles.brandName}>Be Fluent</div>
            <div className={styles.tagline}>Fluency comes first</div>
          </div>
        </div>
        <button type="button" onClick={printReport} className={styles.printButton} aria-label={label('طباعة تقرير الملاحظة', 'Print feedback report')} data-testid={`button-print-feedback-${reportId}`}>
          <Printer size={16} aria-hidden="true" />
          {label('طباعة التقرير', 'Print report')}
        </button>
      </div>

      <div className={styles.titleLine}>
        <h2>{label('ملاحظات الحصة', 'Session feedback')}</h2>
        {date && <time className={styles.date} dateTime={item.session?.startTime || item.publishedAt || undefined}>{date}</time>}
      </div>

      <div className={styles.metadata} aria-label={label('بيانات الحصة', 'Session details')}>
        {item.studentName && <div className={styles.metaItem}><span className={styles.metaLabel}>{label('الطالب', 'Student')}</span><span className={styles.metaValue}><Text value={item.studentName} /></span></div>}
        {item.session?.title && <div className={styles.metaItem}><span className={styles.metaLabel}>{label('الحصة', 'Session')}</span><span className={styles.metaValue}><Text value={item.session.title} /></span></div>}
        {item.session?.startTime && <div className={styles.metaItem}><span className={styles.metaLabel}>{label('التاريخ', 'Date')}</span><span className={styles.metaValue}>{prettyDate(item.session.startTime, language)}</span></div>}
      </div>

      {item.summary?.trim() && <section className={styles.summary} aria-label={label('ملخص الحصة', 'Session summary')}><Text value={item.summary} /></section>}

      {(['VOCABULARY', 'IDIOM', 'SLANG', 'CHUNK'] as Category[]).map((category) => {
        const rows = expressions.filter((expression) => categoryOf(expression.category) === category)
        if (!rows.length) return null
        const [ar, en] = categoryNames[category]
        return <section className={styles.section} key={category}>
          <h3 className={styles.sectionHeading}>{label(ar, en)}</h3>
          <div className={styles.sectionBody}>
            {rows.map((expression, index) => <div className={styles.expressionRow} key={`${expression.expression || 'expression'}-${index}`}>
              <Text value={expression.expression} className={styles.expressionTerm} />
              <Text value={expression.meaning} className={styles.expressionDetail} />
              {expression.example && <div className={styles.example}><strong>{label('مثال:', 'Example:')}</strong> <Text value={expression.example} /></div>}
            </div>)}
          </div>
        </section>
      })}

      {mistakes.length > 0 && <section className={styles.section}>
        <h3 className={styles.sectionHeading}>{label('أخطاء شائعة', 'Common mistakes')}</h3>
        <div className={styles.sectionBody}>
          <table className={styles.mistakeTable}>
            <thead><tr><th className={styles.wrong}>{label('غير صحيح', 'Wrong')}</th><th className={styles.right}>{label('الصحيح', 'Right')}</th></tr></thead>
            <tbody>{mistakes.map((mistake, index) => <tr key={`${mistake.original || 'mistake'}-${index}`}>
              <td><Text value={mistake.original} />{mistake.explanation && <span className={styles.explanation}><Text value={mistake.explanation} /></span>}</td>
              <td className={styles.right}><Text value={mistake.correction} /></td>
            </tr>)}</tbody>
          </table>
        </div>
      </section>}

      {pronunciation.length > 0 && <section className={styles.section}>
        <h3 className={styles.sectionHeading}>{label('ملاحظات النطق', 'Pronunciation')}</h3>
        <div className={styles.sectionBody}>{pronunciation.map((entry, index) => <div className={styles.pronunciationCard} key={`${entry.target || 'pronunciation'}-${index}`}>
          <div className={styles.pronunciationGrid}>
            {entry.target && <div><span className={styles.smallLabel}>{label('المستهدف', 'Target')}</span><div className={styles.pronunciationValue}><Text value={entry.target} /></div></div>}
            {entry.actual && <div><span className={styles.smallLabel}>{label('النطق الفعلي', 'What was heard')}</span><div className={styles.pronunciationValue}><Text value={entry.actual} /></div></div>}
            {entry.phonetic && <div><span className={styles.smallLabel}>{label('التهجئة الصوتية', 'Phonetic spelling')}</span><div className={styles.pronunciationValue}><Text value={entry.phonetic} /></div></div>}
          </div>
          {entry.guidance && <p className={styles.bodyCopy}><strong>{label('إرشاد:', 'Guidance:')}</strong> <Text value={entry.guidance} /></p>}
          {entry.teacherNote && <p className={styles.bodyCopy}><strong>{label('ملاحظة النطق:', 'Pronunciation note:')}</strong> <Text value={entry.teacherNote} /></p>}
        </div>)}</div>
      </section>}

      {ebi.length > 0 && <section className={styles.section}>
        <h3 className={styles.sectionHeading}>{label('تعبيرات أفضل للتطوير', 'Better expressions to try')}</h3>
        <div className={styles.sectionBody}>{ebi.map((entry, index) => <div className={styles.ebiCard} key={`${entry.betterExpression || 'ebi'}-${index}`}>
          {entry.priority && <span className={styles.priority}>{label('الأولوية', 'Priority')}: {label(entry.priority === 'HIGH' ? 'عالية' : entry.priority === 'LOW' ? 'منخفضة' : 'عادية', entry.priority === 'HIGH' ? 'High' : entry.priority === 'LOW' ? 'Low' : 'Normal')}</span>}
          <strong><Text value={entry.betterExpression} /></strong>
          {entry.explanation && <p className={styles.bodyCopy}><Text value={entry.explanation} /></p>}
        </div>)}</div>
      </section>}

      {hasRatings && <section className={styles.section}>
        <h3 className={styles.sectionHeading}>{label('تقييم المهارات', 'Skill ratings')}</h3>
        <div className={styles.sectionBody}>{item.skillRatings?.map((entry, index) => <div className={styles.expressionRow} key={`${entry.skill || entry.name || 'skill'}-${index}`}>
          <Text value={entry.skill || entry.name} className={styles.expressionTerm} />
          <span className={styles.expressionDetail}>{ratingsLabel(entry.rating, entry.score)}</span>
        </div>)}</div>
      </section>}
    </article>
  )
}