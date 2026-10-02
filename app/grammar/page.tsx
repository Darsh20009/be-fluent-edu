'use client'

import { useState } from 'react'
import { Search, BookOpen, ChevronDown, ChevronUp, Home } from 'lucide-react'
import { grammarRules, searchGrammarRules, getGrammarCategories, type GrammarRule } from '@/lib/grammar-rules'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import { useRouter } from 'next/navigation'
import { MarketingFrame } from '@/components/marketing/MarketingFrame'
import { useTheme } from '@/lib/contexts/ThemeContext'
import { localeText } from '@/lib/locale'

export default function GrammarPage() {
  const { language } = useTheme()
  const t = (ar: string, en: string) => localeText(language, ar, en)
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [expandedRule, setExpandedRule] = useState<string | null>(null)
  
  const categories = getGrammarCategories()
  const filteredRules = searchQuery
    ? searchGrammarRules(searchQuery)
    : selectedCategory === 'all'
    ? grammarRules
    : grammarRules.filter(rule => rule.category === selectedCategory)

  const toggleRule = (ruleId: string) => {
    setExpandedRule(expandedRule === ruleId ? null : ruleId)
  }

  return (
    <MarketingFrame>
      <div dir={language === 'ar' ? 'rtl' : 'ltr'} className="border-b border-[#dfe5dd] bg-[#1c332e] p-6 text-white">
        <div className="mx-auto max-w-[1130px]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <BookOpen className="h-8 w-8" />
              <div>
              <h1 className="text-3xl font-bold">{t('قواعد اللغة الإنجليزية', 'English grammar')}</h1>
              <p className="mt-1 text-sm text-white/65">{t('دليل عملي للقاعدة التي تحتاجها الآن.', 'A practical guide to the rule you need now.')}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={() => router.push('/')}
              className="border border-white/30 text-white hover:bg-white/10"
            >
              <Home className="ml-2 h-5 w-5" />
              {t('الرئيسية', 'Home')}
            </Button>
          </div>
        </div>
      </div>

      <div dir={language === 'ar' ? 'rtl' : 'ltr'} className="mx-auto max-w-[1130px] px-5 py-10">
        <Card variant="elevated" className="mb-6 border border-[#dbe3dc] bg-[#fffefa] shadow-none">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder={t('ابحث عن قاعدة...', 'Search for a rule...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-lg"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === 'all' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => {
                  setSelectedCategory('all')
                  setSearchQuery('')
                }}
              >
                {t('الكل', 'All')}
              </Button>
              {categories.map((cat) => (
                <Button
                  key={cat.en}
                  variant={selectedCategory === cat.en ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setSelectedCategory(cat.en)
                    setSearchQuery('')
                  }}
                >
                  {language === 'ar' ? cat.ar : cat.en}
                </Button>
              ))}
            </div>
          </div>
        </Card>

        {filteredRules.length === 0 ? (
          <Card variant="elevated" className="text-center py-12 bg-white">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-gray-600">{t('لم يتم العثور على قواعد', 'No rules found')}</p>
            <p className="text-gray-500 mt-2">{t('جرب كلمة بحث أخرى', 'Try a different search term')}</p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredRules.map((rule) => (
              <Card
                key={rule.id}
                variant="elevated"
                className="overflow-hidden border border-[#dbe3dc] bg-[#fffefa] shadow-none transition-colors hover:border-[#147050]"
              >
                <button
                  onClick={() => toggleRule(rule.id)}
                  className="w-full p-6 text-right transition-colors hover:bg-[#f6f8f3]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                          <span className="bg-[#147050] px-3 py-1 text-xs font-semibold text-white">
                          {language === 'ar' ? rule.categoryAr : rule.category}
                        </span>
                      </div>
                        <h3 className="mb-1 text-xl font-bold text-[#147050]">
                         {language === 'ar' ? rule.titleAr : rule.title}
                       </h3>
                       <p className="text-gray-700 mb-1">{language === 'ar' ? rule.descriptionAr : rule.description}</p>
                    </div>
                    <div className="flex-shrink-0">
                      {expandedRule === rule.id ? (
                          <ChevronUp className="h-6 w-6 text-[#147050]" />
                      ) : (
                          <ChevronDown className="h-6 w-6 text-[#147050]" />
                      )}
                    </div>
                  </div>
                </button>

                {expandedRule === rule.id && (
                   <div className="border-t border-[#dfe5dd] bg-[#f6f8f3] px-6 pb-6 pt-4">
                    <div className="space-y-4">
                      <div>
                         <h4 className="mb-3 flex items-center gap-2 text-lg font-bold text-[#147050]">
                           <span className="h-2 w-2 bg-[#147050]"></span>
                            {t('أمثلة', 'Examples')}
                        </h4>
                        <div className="space-y-3">
                          {rule.examples.map((example, index) => (
                            <div
                              key={index}
                               className="border-r-4 border-[#147050] bg-[#fffefa] p-4"
                            >
                             <p className="text-gray-800 font-medium mb-1">{language === 'ar' ? example.ar : example.en}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {rule.notes && (
                         <div className="border-r-4 border-[#b78732] bg-[#f8f1df] p-4">
                           <h4 className="mb-2 flex items-center gap-2 font-bold text-[#795b20]">
                             {t('ملاحظات مهمة', 'Important notes')}
                          </h4>
                           <p className="text-gray-800 mb-1">{language === 'ar' ? rule.notesAr || rule.notes : rule.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
           <Card variant="elevated" className="bg-[#1c332e] text-white shadow-none">
            <div className="p-6">
              <h3 className="text-2xl font-bold mb-2">{t('إجمالي القواعد', 'Total grammar rules')}</h3>
              <p className="text-4xl font-bold">{grammarRules.length}</p>
              <p className="text-sm text-gray-200 mt-2">
                 {t('استمر في التعلم وتحسين إنجليزيتك!', 'Keep learning and improving your English!')}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </MarketingFrame>
  )
}
