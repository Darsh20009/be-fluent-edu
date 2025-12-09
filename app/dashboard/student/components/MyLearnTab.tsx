'use client'

import { useState, useEffect, useRef } from 'react'
import { Plus, Trash2, Check, X, FileDown, Upload, Languages, CheckSquare } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Alert from '@/components/ui/Alert'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Badge from '@/components/ui/Badge'
import { exportWordsToExcel } from '@/lib/utils/exportToExcel'

interface Word {
  id: string
  englishWord: string
  arabicMeaning: string
  exampleSentence: string | null
  known: boolean
  reviewCount: number
  createdAt: string
}

export default function MyLearnTab({ isActive }: { isActive: boolean }) {
  const [words, setWords] = useState<Word[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showImportForm, setShowImportForm] = useState(false)
  const [selectedWords, setSelectedWords] = useState<Set<string>>(new Set())
  const [newWord, setNewWord] = useState({
    englishWord: '',
    arabicMeaning: '',
    exampleSentence: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [translating, setTranslating] = useState(false)
  const [importing, setImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isActive) {
      fetchWords()
    }
  }, [isActive])

  async function fetchWords() {
    try {
      const response = await fetch('/api/words')
      if (response.ok) {
        const data = await response.json()
        setWords(data)
      }
    } catch (error) {
      console.error('Error fetching words:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleAddWord() {
    if (!newWord.englishWord || !newWord.arabicMeaning) {
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/words', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newWord)
      })

      if (response.ok) {
        const word = await response.json()
        setWords([word, ...words])
        setNewWord({ englishWord: '', arabicMeaning: '', exampleSentence: '' })
        setShowAddForm(false)
      }
    } catch (error) {
      console.error('Error adding word:', error)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleToggleKnown(wordId: string, currentKnown: boolean) {
    try {
      const response = await fetch(`/api/words/${wordId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ known: !currentKnown })
      })

      if (response.ok) {
        setWords(words.map(w => 
          w.id === wordId ? { ...w, known: !currentKnown } : w
        ))
      }
    } catch (error) {
      console.error('Error updating word:', error)
    }
  }

  async function handleDeleteWord(wordId: string) {
    if (!confirm('Are you sure you want to delete this word?')) {
      return
    }

    try {
      const response = await fetch(`/api/words/${wordId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setWords(words.filter(w => w.id !== wordId))
      }
    } catch (error) {
      console.error('Error deleting word:', error)
    }
  }

  async function handleDeleteSelected() {
    if (selectedWords.size === 0) return
    
    if (!confirm(`Are you sure you want to delete ${selectedWords.size} word(s)?`)) {
      return
    }

    try {
      const deletePromises = Array.from(selectedWords).map(wordId =>
        fetch(`/api/words/${wordId}`, { method: 'DELETE' })
      )
      
      await Promise.all(deletePromises)
      setWords(words.filter(w => !selectedWords.has(w.id)))
      setSelectedWords(new Set())
    } catch (error) {
      console.error('Error deleting words:', error)
      alert('Error deleting some words. Please try again.')
    }
  }

  function toggleSelect(wordId: string) {
    const newSelected = new Set(selectedWords)
    if (newSelected.has(wordId)) {
      newSelected.delete(wordId)
    } else {
      newSelected.add(wordId)
    }
    setSelectedWords(newSelected)
  }

  function selectAll() {
    if (selectedWords.size === words.length) {
      setSelectedWords(new Set())
    } else {
      setSelectedWords(new Set(words.map(w => w.id)))
    }
  }

  async function handleTranslate() {
    if (!newWord.englishWord) return
    
    setTranslating(true)
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newWord.englishWord, sourceLang: 'en', targetLang: 'ar' })
      })
      
      if (response.ok) {
        const data = await response.json()
        setNewWord({ ...newWord, arabicMeaning: data.translation })
      }
    } catch (error) {
      console.error('Translation error:', error)
      alert('Translation failed')
    } finally {
      setTranslating(false)
    }
  }

  async function handleFileImport(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setImporting(true)
    try {
      const text = await file.text()
      const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)
      
      const wordsToImport = lines.slice(0, 100).map(line => ({
        englishWord: line,
        arabicMeaning: '',
        exampleSentence: ''
      }))

      const response = await fetch('/api/words/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ words: wordsToImport })
      })

      if (response.ok) {
        const data = await response.json()
        alert(`Successfully imported ${data.count} words!`)
        fetchWords()
        setShowImportForm(false)
      }
    } catch (error) {
      console.error('Import error:', error)
      alert('Failed to import words')
    } finally {
      setImporting(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  if (!isActive) {
    return (
      <div>
        <h2 className="text-3xl font-bold text-[#004E89] mb-6">
          MyLearn - My Words / كلماتي
        </h2>
        <Alert variant="warning">
          <p>Activate your account to access this feature / قم بتفعيل حسابك للوصول لهذه الميزة</p>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
          MyLearn - My Words / كلماتي
        </h2>
        <div className="flex gap-2 flex-wrap">
          {words.length > 0 && (
            <>
              <Button
                variant="outline"
                onClick={selectAll}
                size="sm"
              >
                <CheckSquare className="h-4 w-4 mr-2" />
                {selectedWords.size === words.length ? 'Deselect All / إلغاء الكل' : 'Select All / تحديد الكل'}
              </Button>
              {selectedWords.size > 0 && (
                <Button
                  variant="outline"
                  onClick={handleDeleteSelected}
                  size="sm"
                  className="border-red-500 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected ({selectedWords.size}) / حذف المحدد
                </Button>
              )}
            </>
          )}
          <Button
            variant="outline"
            onClick={() => setShowImportForm(!showImportForm)}
          >
            <Upload className="h-4 w-4 mr-2" />
            Import / استيراد
          </Button>
          <Button
            variant="outline"
            onClick={() => exportWordsToExcel(words.filter(w => !w.known), 'unknown-words.xlsx', true)}
            disabled={words.filter(w => !w.known).length === 0}
          >
            <FileDown className="h-4 w-4 mr-2" />
            Export Unknown / تصدير غير المحفوظة
          </Button>
          <Button
            variant="outline"
            onClick={() => exportWordsToExcel(words, 'all-words.xlsx')}
            disabled={words.length === 0}
          >
            <FileDown className="h-4 w-4 mr-2" />
            Export All / تصدير الكل
          </Button>
          <Button
            variant="primary"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Word / أضف كلمة
          </Button>
        </div>
      </div>

      {showImportForm && (
        <Card variant="elevated">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Import Words / استيراد الكلمات
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Upload a text file with one English word per line (max 100 words). Words will be automatically translated to Arabic.
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4" dir="rtl">
            قم برفع ملف نصي يحتوي على كلمة إنجليزية واحدة في كل سطر (حد أقصى 100 كلمة). سيتم ترجمة الكلمات تلقائيًا إلى العربية.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt"
            onChange={handleFileImport}
            disabled={importing}
            className="block w-full text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-800 focus:outline-none p-2"
          />
          {importing && (
            <div className="mt-4 text-center">
              <LoadingSpinner size="md" />
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Importing and translating words...
              </p>
            </div>
          )}
        </Card>
      )}

      {showAddForm && (
        <Card variant="elevated">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Add New Word / أضف كلمة جديدة</h3>
          <div className="space-y-4">
            <Input
              label="English Word / الكلمة بالإنجليزية"
              value={newWord.englishWord}
              onChange={(e) => setNewWord({ ...newWord, englishWord: e.target.value })}
              placeholder="e.g., Hello"
            />
            <div>
              <Input
                label="Arabic Meaning / المعنى بالعربية"
                value={newWord.arabicMeaning}
                onChange={(e) => setNewWord({ ...newWord, arabicMeaning: e.target.value })}
                placeholder="مثال: مرحباً"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleTranslate}
                disabled={!newWord.englishWord || translating}
                className="mt-2"
              >
                <Languages className="h-4 w-4 mr-2" />
                {translating ? 'Translating...' : 'Auto Translate / ترجمة تلقائية'}
              </Button>
            </div>
            <Input
              label="Example Sentence (Optional) / جملة توضيحية (اختياري)"
              value={newWord.exampleSentence}
              onChange={(e) => setNewWord({ ...newWord, exampleSentence: e.target.value })}
              placeholder="e.g., Hello, how are you?"
            />
            <div className="flex gap-2">
              <Button
                variant="primary"
                onClick={handleAddWord}
                disabled={submitting || !newWord.englishWord || !newWord.arabicMeaning}
              >
                {submitting ? 'Adding...' : 'Add / إضافة'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowAddForm(false)}
              >
                Cancel / إلغاء
              </Button>
            </div>
          </div>
        </Card>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : words.length === 0 ? (
        <Alert variant="info">
          <p>No words saved yet. Start adding words to build your vocabulary!</p>
          <p>لم تقم بحفظ أي كلمات بعد. ابدأ بإضافة كلمات لبناء مفرداتك!</p>
        </Alert>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {words.map((word) => (
            <Card 
              key={word.id} 
              variant="elevated"
              className={`transition-all ${selectedWords.has(word.id) ? 'ring-2 ring-gray-900 bg-gray-50' : ''}`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={selectedWords.has(word.id)}
                  onChange={() => toggleSelect(word.id)}
                  className="mt-1 h-5 w-5 rounded border-gray-300 text-gray-900 focus:ring-gray-900 cursor-pointer"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-gray-900">{word.englishWord}</h3>
                    {word.known && (
                      <Badge variant="success" size="sm">
                        <Check className="h-3 w-3 mr-1" />
                        Known
                      </Badge>
                    )}
                  </div>
                  <p className="text-gray-700 mb-2">{word.arabicMeaning}</p>
                  {word.exampleSentence && (
                    <p className="text-sm text-gray-600 italic">{word.exampleSentence}</p>
                  )}
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant={word.known ? 'outline' : 'primary'}
                      size="sm"
                      fullWidth
                      onClick={() => handleToggleKnown(word.id, word.known)}
                    >
                      {word.known ? (
                        <>
                          <X className="h-4 w-4 mr-1" />
                          Mark Unknown / غير محفوظة
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4 mr-1" />
                          Mark Known / محفوظة
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteWord(word.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="text-center text-gray-600">
        <p className="text-lg font-semibold">
          Total Words: {words.length} | Known: {words.filter(w => w.known).length}
        </p>
        <p className="text-sm">
          إجمالي الكلمات: {words.length} | محفوظة: {words.filter(w => w.known).length}
        </p>
      </div>
    </div>
  )
}
