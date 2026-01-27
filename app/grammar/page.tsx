'use client'

import { useState } from 'react'
import { Search, BookOpen, ChevronDown, ChevronUp, Home } from 'lucide-react'
import { grammarRules, searchGrammarRules, getGrammarCategories, type GrammarRule } from '@/lib/grammar-rules'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import { useRouter } from 'next/navigation'

export default function GrammarPage() {
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
    <div className="min-h-screen bg-gradient-to-br from-[#F9FAFB] via-white to-[#F9FAFB]">
      <div className="bg-gradient-to-r from-[#10B981] to-[#059669] text-white p-6 shadow-2xl">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <BookOpen className="h-8 w-8" />
              <div>
                <h1 className="text-3xl font-bold">Grammar Rules / قواعد اللغة</h1>
                <p className="text-sm text-gray-200 mt-1">دليلك الشامل لقواعد اللغة الإنجليزية</p>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={() => router.push('/')}
              className="text-white hover:bg-white/20"
            >
              <Home className="h-5 w-5 mr-2" />
              Home / الرئيسية
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Card variant="elevated" className="mb-6 bg-white">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="ابحث عن قاعدة... Search for a rule..."
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
                All / الكل
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
                  {cat.en} / {cat.ar}
                </Button>
              ))}
            </div>
          </div>
        </Card>

        {filteredRules.length === 0 ? (
          <Card variant="elevated" className="text-center py-12 bg-white">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-gray-600">No rules found / لم يتم العثور على قواعد</p>
            <p className="text-gray-500 mt-2">Try a different search term / جرب كلمة بحث أخرى</p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredRules.map((rule) => (
              <Card
                key={rule.id}
                variant="elevated"
                className="overflow-hidden transition-all duration-300 hover:shadow-2xl bg-white border-2 border-gray-100"
              >
                <button
                  onClick={() => toggleRule(rule.id)}
                  className="w-full text-left p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 bg-[#10B981] text-white text-xs font-semibold rounded-full">
                          {rule.category} / {rule.categoryAr}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-[#10B981] mb-1">
                        {rule.title}
                      </h3>
                      <h4 className="text-lg font-semibold text-gray-700 mb-3">
                        {rule.titleAr}
                      </h4>
                      <p className="text-gray-700 mb-1">{rule.description}</p>
                      <p className="text-gray-600 text-sm">{rule.descriptionAr}</p>
                    </div>
                    <div className="flex-shrink-0">
                      {expandedRule === rule.id ? (
                        <ChevronUp className="h-6 w-6 text-[#10B981]" />
                      ) : (
                        <ChevronDown className="h-6 w-6 text-[#10B981]" />
                      )}
                    </div>
                  </div>
                </button>

                {expandedRule === rule.id && (
                  <div className="px-6 pb-6 border-t border-gray-200 pt-4 bg-gradient-to-b from-white to-gray-50">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-bold text-[#10B981] mb-3 text-lg flex items-center gap-2">
                          <span className="w-2 h-2 bg-[#10B981] rounded-full"></span>
                          Examples / أمثلة
                        </h4>
                        <div className="space-y-3">
                          {rule.examples.map((example, index) => (
                            <div
                              key={index}
                              className="bg-white p-4 rounded-lg border-l-4 border-[#10B981] shadow-sm hover:shadow-md transition-shadow"
                            >
                              <p className="text-gray-800 font-medium mb-1">{example.en}</p>
                              <p className="text-gray-600">{example.ar}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {rule.notes && (
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
                          <h4 className="font-bold text-yellow-800 mb-2 flex items-center gap-2">
                            <span className="text-lg">💡</span>
                            Important Notes / ملاحظات مهمة
                          </h4>
                          <p className="text-gray-800 mb-1">{rule.notes}</p>
                          {rule.notesAr && <p className="text-gray-700">{rule.notesAr}</p>}
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
          <Card variant="elevated" className="bg-gradient-to-r from-[#10B981] to-[#059669] text-white">
            <div className="p-6">
              <h3 className="text-2xl font-bold mb-2">Total Grammar Rules / إجمالي القواعد</h3>
              <p className="text-4xl font-bold">{grammarRules.length}</p>
              <p className="text-sm text-gray-200 mt-2">
                Keep learning and improving your English! / استمر في التعلم وتحسين إنجليزيتك!
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
