'use client'

import Link from 'next/link'
import { BookOpen, CheckCircle } from 'lucide-react'
import { MarketingFrame } from '@/components/marketing/MarketingFrame'
import { useTheme } from '@/lib/contexts/ThemeContext'
import { localeText } from '@/lib/locale'

export default function GrammarRulesPage() {
  const { language } = useTheme()
  const t = (ar: string, en: string) => localeText(language, ar, en)
  const englishUsage: Record<string, string> = {
    'للعادات والحقائق': 'For habits and facts',
    'للأحداث الجارية': 'For actions happening now',
    'للأحداث المنتهية بتأثير حالي': 'For completed actions with a present result',
    'للأحداث المنتهية في الماضي': 'For completed past actions',
    'للأحداث المستمرة في الماضي': 'For actions in progress in the past',
    'للأحداث التي حدثت قبل حدث ماضي آخر': 'For an action completed before another past action',
    'للأحداث المستقبلية': 'For future events',
    'للأحداث المستمرة في المستقبل': 'For actions in progress in the future',
    'للإشارة إلى شيء محدد ومعروف': 'To refer to something specific and known',
    'A قبل الحروف الساكنة، An قبل الحروف المتحركة': 'Use “a” before consonant sounds and “an” before vowel sounds',
    'مع الأسماء العامة والمجردة': 'With general and abstract nouns',
    'تأتي كفاعل في الجملة': 'Used as the subject of a sentence',
    'تأتي كمفعول به': 'Used as the object of a sentence',
    'للدلالة على الملكية': 'To indicate possession',
    'عندما يكون الفاعل والمفعول نفس الشخص': 'When the subject and object are the same person',
    'At للوقت المحدد، On لليوم، In للشهر/السنة': 'Use “at” for a specific time, “on” for a day, and “in” for a month or year',
    'In للمساحات المغلقة، On للأسطح، At للنقاط': 'Use “in” for enclosed spaces, “on” for surfaces, and “at” for points',
    'للدلالة على الحركة والاتجاه': 'To express movement and direction',
    'للقدرة والإمكانية': 'For ability and possibility',
    'للاحتمال والإذن': 'For possibility and permission',
    'للضرورة والإلزام': 'For necessity and obligation',
    'للنصيحة والتوصية': 'For advice and recommendations',
    'للمستقبل والعروض': 'For the future and offers',
    'للحقائق العامة': 'For general truths',
    'للمستقبل المحتمل': 'For a possible future',
    'للحاضر أو المستقبل غير المحتمل': 'For an unlikely present or future',
    'للماضي الافتراضي': 'For an unreal past situation',
    'تصف الأسماء': 'Describe nouns',
    'تصف كيفية حدوث الفعل': 'Describe how an action happens',
    'للمقارنة بين شيئين': 'To compare two things',
    'للدلالة على الأفضلية': 'To indicate the highest degree',
    'تبدأ بفعل مساعد (Do, Does, Did, Is, Are...)': 'Begin with an auxiliary verb (do, does, did, is, are, etc.)',
    'تبدأ بأدوات الاستفهام (What, Where, When, Why, Who, How)': 'Begin with a question word (what, where, when, why, who, or how)',
    'للتأكيد أو طلب الموافقة': 'To confirm information or ask for agreement',
    'تتغير الأزمنة خطوة للماضي': 'Tenses usually shift one step back into the past',
    'تُحول الأسئلة لجمل خبرية': 'Questions are changed into reported statements',
    'بعد حروف الجر وأفعال معينة': 'After prepositions and certain verbs',
    'بعد أفعال الرغبة والقرار': 'After verbs of desire and decision',
    'بعض الأفعال تقبل الاثنين': 'Some verbs can be followed by either form',
    'فاعل + فعل + مفعول': 'Subject + verb + object',
    'جملتان متصلتان بـ and, but, or': 'Two clauses joined with and, but, or',
    'جملة رئيسية + جملة تابعة': 'A main clause plus a subordinate clause',
  }
  const localized = (value: string) => {
    const parts = value.split(' / ')
    if (parts.length > 1) return language === 'ar' ? parts[parts.length - 1] : parts.slice(0, -1).join(' / ')
    return language === 'en' ? englishUsage[value] || value : value
  }
  const grammarRules = [
    {
      id: 1,
      title: 'Tenses / الأزمنة',
      rules: [
        { name: 'Present Simple / المضارع البسيط', example: 'I eat / أنا آكل', usage: 'للعادات والحقائق' },
        { name: 'Present Continuous / المضارع المستمر', example: 'I am eating / أنا آكل الآن', usage: 'للأحداث الجارية' },
        { name: 'Present Perfect / المضارع التام', example: 'I have eaten / لقد أكلت', usage: 'للأحداث المنتهية بتأثير حالي' },
        { name: 'Past Simple / الماضي البسيط', example: 'I ate / أكلت', usage: 'للأحداث المنتهية في الماضي' },
        { name: 'Past Continuous / الماضي المستمر', example: 'I was eating / كنت آكل', usage: 'للأحداث المستمرة في الماضي' },
        { name: 'Past Perfect / الماضي التام', example: 'I had eaten / كنت قد أكلت', usage: 'للأحداث التي حدثت قبل حدث ماضي آخر' },
        { name: 'Future Simple / المستقبل البسيط', example: 'I will eat / سآكل', usage: 'للأحداث المستقبلية' },
        { name: 'Future Continuous / المستقبل المستمر', example: 'I will be eating / سأكون آكل', usage: 'للأحداث المستمرة في المستقبل' },
      ]
    },
    {
      id: 2,
      title: 'Articles / أدوات التعريف',
      rules: [
        { name: 'Definite Article (The)', example: 'The book is on the table', usage: 'للإشارة إلى شيء محدد ومعروف' },
        { name: 'Indefinite Articles (A/An)', example: 'A book, An apple', usage: 'A قبل الحروف الساكنة، An قبل الحروف المتحركة' },
        { name: 'Zero Article / عدم استخدام أداة', example: 'I love music', usage: 'مع الأسماء العامة والمجردة' },
      ]
    },
    {
      id: 3,
      title: 'Pronouns / الضمائر',
      rules: [
        { name: 'Subject Pronouns / ضمائر الفاعل', example: 'I, You, He, She, It, We, They', usage: 'تأتي كفاعل في الجملة' },
        { name: 'Object Pronouns / ضمائر المفعول', example: 'Me, You, Him, Her, It, Us, Them', usage: 'تأتي كمفعول به' },
        { name: 'Possessive Pronouns / ضمائر الملكية', example: 'Mine, Yours, His, Hers, Ours, Theirs', usage: 'للدلالة على الملكية' },
        { name: 'Reflexive Pronouns / الضمائر الانعكاسية', example: 'Myself, Yourself, Himself, Herself, Itself', usage: 'عندما يكون الفاعل والمفعول نفس الشخص' },
      ]
    },
    {
      id: 4,
      title: 'Prepositions / حروف الجر',
      rules: [
        { name: 'Prepositions of Time / حروف الجر الزمنية', example: 'At 5 PM, On Monday, In June', usage: 'At للوقت المحدد، On لليوم، In للشهر/السنة' },
        { name: 'Prepositions of Place / حروف الجر المكانية', example: 'In the room, On the table, At the door', usage: 'In للمساحات المغلقة، On للأسطح، At للنقاط' },
        { name: 'Prepositions of Movement / حروف الجر الحركية', example: 'To, From, Into, Out of, Across', usage: 'للدلالة على الحركة والاتجاه' },
      ]
    },
    {
      id: 5,
      title: 'Modal Verbs / أفعال المساعدة',
      rules: [
        { name: 'Can / Could / يستطيع', example: 'I can swim / أستطيع السباحة', usage: 'للقدرة والإمكانية' },
        { name: 'May / Might / ربما', example: 'It may rain / قد تمطر', usage: 'للاحتمال والإذن' },
        { name: 'Must / Have to / يجب', example: 'You must study / يجب أن تدرس', usage: 'للضرورة والإلزام' },
        { name: 'Should / Ought to / ينبغي', example: 'You should rest / ينبغي أن تستريح', usage: 'للنصيحة والتوصية' },
        { name: 'Will / Would / سوف', example: 'I will help you / سأساعدك', usage: 'للمستقبل والعروض' },
      ]
    },
    {
      id: 6,
      title: 'Conditionals / الجمل الشرطية',
      rules: [
        { name: 'Zero Conditional / الشرط الصفري', example: 'If you heat water, it boils', usage: 'للحقائق العامة' },
        { name: 'First Conditional / الشرط الأول', example: 'If it rains, I will stay home', usage: 'للمستقبل المحتمل' },
        { name: 'Second Conditional / الشرط الثاني', example: 'If I had money, I would travel', usage: 'للحاضر أو المستقبل غير المحتمل' },
        { name: 'Third Conditional / الشرط الثالث', example: 'If I had studied, I would have passed', usage: 'للماضي الافتراضي' },
      ]
    },
    {
      id: 7,
      title: 'Adjectives & Adverbs / الصفات والظروف',
      rules: [
        { name: 'Adjectives / الصفات', example: 'A beautiful flower / زهرة جميلة', usage: 'تصف الأسماء' },
        { name: 'Adverbs of Manner / ظروف الحال', example: 'She sings beautifully / تغني بجمال', usage: 'تصف كيفية حدوث الفعل' },
        { name: 'Comparative Adjectives / صيغة المقارنة', example: 'Bigger, More beautiful', usage: 'للمقارنة بين شيئين' },
        { name: 'Superlative Adjectives / صيغة التفضيل', example: 'Biggest, Most beautiful', usage: 'للدلالة على الأفضلية' },
      ]
    },
    {
      id: 8,
      title: 'Question Formation / تكوين الأسئلة',
      rules: [
        { name: 'Yes/No Questions', example: 'Do you like tea?', usage: 'تبدأ بفعل مساعد (Do, Does, Did, Is, Are...)' },
        { name: 'Wh- Questions', example: 'What do you want? / ماذا تريد؟', usage: 'تبدأ بأدوات الاستفهام (What, Where, When, Why, Who, How)' },
        { name: 'Question Tags / أسئلة الذيل', example: 'You like coffee, don\'t you?', usage: 'للتأكيد أو طلب الموافقة' },
      ]
    },
    {
      id: 9,
      title: 'Passive Voice / المبني للمجهول',
      rules: [
        { name: 'Present Passive', example: 'The letter is written / تُكتب الرسالة', usage: 'be + past participle' },
        { name: 'Past Passive', example: 'The letter was written / كُتبت الرسالة', usage: 'was/were + past participle' },
        { name: 'Future Passive', example: 'The letter will be written / ستُكتب الرسالة', usage: 'will be + past participle' },
      ]
    },
    {
      id: 10,
      title: 'Reported Speech / الكلام المنقول',
      rules: [
        { name: 'Statements / الجمل الخبرية', example: 'He said (that) he was tired', usage: 'تتغير الأزمنة خطوة للماضي' },
        { name: 'Questions / الأسئلة', example: 'He asked if I was ready', usage: 'تُحول الأسئلة لجمل خبرية' },
        { name: 'Commands / الأوامر', example: 'He told me to come', usage: 'tell/ask + object + to + infinitive' },
      ]
    },
    {
      id: 11,
      title: 'Gerunds & Infinitives / المصادر والأسماء الفعلية',
      rules: [
        { name: 'Gerunds (Verb + -ing)', example: 'I enjoy swimming / أستمتع بالسباحة', usage: 'بعد حروف الجر وأفعال معينة' },
        { name: 'Infinitives (to + verb)', example: 'I want to swim / أريد أن أسبح', usage: 'بعد أفعال الرغبة والقرار' },
        { name: 'Verbs followed by both', example: 'I like swimming = I like to swim', usage: 'بعض الأفعال تقبل الاثنين' },
      ]
    },
    {
      id: 12,
      title: 'Sentence Structure / بنية الجملة',
      rules: [
        { name: 'Simple Sentence / الجملة البسيطة', example: 'I eat breakfast', usage: 'فاعل + فعل + مفعول' },
        { name: 'Compound Sentence / الجملة المركبة', example: 'I eat breakfast, and she drinks coffee', usage: 'جملتان متصلتان بـ and, but, or' },
        { name: 'Complex Sentence / الجملة المعقدة', example: 'I eat breakfast before I go to work', usage: 'جملة رئيسية + جملة تابعة' },
      ]
    }
  ]

  return (
    <MarketingFrame>
      <main dir={language === 'ar' ? 'rtl' : 'ltr'} className="mx-auto max-w-[1130px] px-5 py-12 sm:py-16">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BookOpen className="h-9 w-9 text-[#147050]" />
            <h1 className="text-3xl font-bold text-[#1e2b29] sm:text-4xl">{t('قواعد اللغة الإنجليزية', 'English Grammar Rules')}</h1>
          </div>
          <p className="mb-3 text-base sm:text-lg md:text-xl text-gray-700 max-w-3xl mx-auto px-4">
            {t('دليلك الشامل لإتقان قواعد اللغة الإنجليزية', 'Your complete guide to mastering English grammar')}
          </p>
        </div>

        {/* Grammar Rules */}
        <div className="space-y-6 max-w-6xl mx-auto">
          {grammarRules.map((section) => (
            <div
              key={section.id}
               className="overflow-hidden border border-[#dbe3dc] bg-[#fffefa]"
            >
               <div className="border-b border-[#dbe3dc] bg-[#edf6ef] p-4 sm:p-5">
                 <h3 className="flex items-center gap-2 text-xl font-bold text-[#1e2b29] sm:text-2xl">
                   <span className="flex h-8 w-8 items-center justify-center bg-[#147050] text-sm font-bold text-white">
                    {section.id}
                  </span>
                   {localized(section.title)}
                </h3>
              </div>

              <div className="p-4 sm:p-6">
                <div className="space-y-4">
                  {section.rules.map((rule, index) => (
                    <div
                      key={index}
                       className="border border-[#edf0ed] bg-[#f7f8f4] p-4 transition-colors hover:bg-[#edf6ef]"
                    >
                      <div className="flex items-start gap-3">
                         <CheckCircle className="mt-1 h-5 w-5 shrink-0 text-[#147050]" />
                        <div className="flex-1">
                           <h4 className="mb-2 text-base font-bold text-[#147050] sm:text-lg">
                            {localized(rule.name)}
                          </h4>
                          <div className="space-y-1 text-sm sm:text-base">
                            <p className="text-gray-700">
                              <span className="font-semibold">{t('مثال:', 'Example:')}</span> <span className="italic">{localized(rule.example)}</span>
                            </p>
                            <p className="text-gray-600">
                              <span className="font-semibold">{t('الاستخدام:', 'Usage:')}</span> {localized(rule.usage)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
           <div className="mx-auto max-w-2xl border border-[#dbe3dc] bg-[#edf6ef] p-6 sm:p-8">
             <h3 className="mb-4 text-2xl font-bold text-[#147050] sm:text-3xl">
               {t('هل أنت مستعد للممارسة؟', 'Ready to Practice?')}
            </h3>
            <p className="text-gray-600 mb-6">
               {t('انضم إلى Be Fluent وابدأ بتحسين لغتك الإنجليزية مع معلمينا الخبراء!', 'Join Be Fluent and start improving your English with our expert teachers!')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/packages"
                 className="bg-[#147050] px-6 py-3 text-[11px] font-semibold text-white transition-colors hover:bg-[#0e5940]"
              >
                 {t('عرض الباقات', 'View Packages')}
              </Link>
              <Link
                href="/auth/register"
                 className="border border-[#147050] px-6 py-3 text-[11px] font-semibold text-[#147050] transition-colors hover:bg-[#147050] hover:text-white"
              >
                 {t('سجل الآن', 'Register Now')}
              </Link>
            </div>
          </div>
        </div>
      </main>

    </MarketingFrame>
  )
}
