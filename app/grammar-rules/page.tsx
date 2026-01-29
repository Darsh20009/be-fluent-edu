import Link from 'next/link'
import { BookOpen, ArrowLeft, CheckCircle } from 'lucide-react'
import AppHeader from '@/components/layout/AppHeader'
import FloatingContactButtons from '@/components/FloatingContactButtons'

export default function GrammarRulesPage() {
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
    <div className="min-h-screen bg-[#F9FAFB]">
      <AppHeader variant="marketing">
        <Link
          href="/"
          className="px-4 py-2 sm:px-6 sm:py-2 rounded-lg border-2 border-[#10B981] text-[#10B981] hover:bg-[#10B981] hover:text-white transition-colors flex items-center gap-2 text-sm sm:text-base"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back to Home / العودة للرئيسية</span>
          <span className="sm:hidden">Back / عودة</span>
        </Link>
        <Link
          href="/auth/login"
          className="px-4 py-2 sm:px-6 sm:py-2 rounded-lg bg-[#10B981] text-white hover:bg-[#003A6B] transition-colors text-sm sm:text-base"
        >
          Login / تسجيل الدخول
        </Link>
      </AppHeader>

      <main className="container mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BookOpen className="h-10 w-10 sm:h-12 sm:w-12 text-[#10B981]" />
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#10B981]">
              English Grammar Rules
            </h1>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#10B981] mb-3" dir="rtl">
            قواعد اللغة الإنجليزية
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-700 max-w-3xl mx-auto px-4">
            Your complete guide to mastering English grammar
          </p>
          <p className="text-base sm:text-lg md:text-xl text-gray-700 max-w-3xl mx-auto px-4" dir="rtl">
            دليلك الشامل لإتقان قواعد اللغة الإنجليزية
          </p>
        </div>

        {/* Grammar Rules */}
        <div className="space-y-6 max-w-6xl mx-auto">
          {grammarRules.map((section) => (
            <div
              key={section.id}
              className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-[#10B981]/20"
            >
              <div className="bg-gradient-to-r from-[#10B981] to-[#059669] p-4 sm:p-6">
                <h3 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                  <span className="bg-white text-[#10B981] w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                    {section.id}
                  </span>
                  {section.title}
                </h3>
              </div>

              <div className="p-4 sm:p-6">
                <div className="space-y-4">
                  {section.rules.map((rule, index) => (
                    <div
                      key={index}
                      className="bg-[#F9FAFB] rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-1" />
                        <div className="flex-1">
                          <h4 className="font-bold text-[#10B981] mb-2 text-base sm:text-lg">
                            {rule.name}
                          </h4>
                          <div className="space-y-1 text-sm sm:text-base">
                            <p className="text-gray-700">
                              <span className="font-semibold">Example:</span> <span className="italic">{rule.example}</span>
                            </p>
                            <p className="text-gray-600">
                              <span className="font-semibold">Usage / الاستخدام:</span> {rule.usage}
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
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 max-w-2xl mx-auto border-2 border-[#10B981]/20">
            <h3 className="text-2xl sm:text-3xl font-bold text-[#10B981] mb-4">
              Ready to Practice?
            </h3>
            <p className="text-lg text-gray-700 mb-2" dir="rtl">
              هل أنت مستعد للممارسة؟
            </p>
            <p className="text-gray-600 mb-6">
              Join Be Fluent and start improving your English with our expert teachers!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/packages"
                className="px-6 py-3 rounded-lg bg-[#10B981] text-white hover:bg-[#003A6B] transition-colors font-semibold"
              >
                View Packages / الباقات
              </Link>
              <Link
                href="/auth/register"
                className="px-6 py-3 rounded-lg border-2 border-[#10B981] text-[#10B981] hover:bg-[#10B981] hover:text-white transition-colors font-semibold"
              >
                Register Now / سجل الآن
              </Link>
            </div>
          </div>
        </div>
      </main>

      <FloatingContactButtons />
    </div>
  )
}
