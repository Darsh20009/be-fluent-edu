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
import { toast } from 'react-hot-toast'
import ConfirmModal from '@/components/ui/ConfirmModal'
import { useTheme } from '@/lib/contexts/ThemeContext'
import { localeDirection, localeText } from '@/lib/locale'

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
  const { language } = useTheme()
  const t = (ar: string, en: string) => localeText(language, ar, en)
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
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; type: 'single' | 'bulk'; wordId?: string }>({ open: false, type: 'single' })
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
    setConfirmModal({ open: true, type: 'single', wordId })
  }

  async function doDeleteWord() {
    const wordId = confirmModal.wordId
    if (!wordId) return
    setConfirmModal({ open: false, type: 'single' })
    try {
      const response = await fetch(`/api/words/${wordId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setWords(words.filter(w => w.id !== wordId))
        toast.success(t('تم حذف الكلمة', 'Word deleted'))
      } else {
        toast.error(t('فشل حذف الكلمة', 'Failed to delete word'))
      }
    } catch (error) {
      toast.error(t('خطأ في الحذف', 'Error deleting word'))
    }
  }

  async function handleDeleteSelected() {
    if (selectedWords.size === 0) return
    setConfirmModal({ open: true, type: 'bulk' })
  }

  async function doDeleteSelected() {
    setConfirmModal({ open: false, type: 'bulk' })
    try {
      const deletePromises = Array.from(selectedWords).map(wordId =>
        fetch(`/api/words/${wordId}`, { method: 'DELETE' })
      )
      
      await Promise.all(deletePromises)
      setWords(words.filter(w => !selectedWords.has(w.id)))
      setSelectedWords(new Set())
    } catch (error) {
      console.error('Error deleting words:', error)
      toast.error(t('خطأ في حذف بعض الكلمات. يرجى المحاولة مرة أخرى.', 'Some words could not be deleted. Please try again.'))
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
      toast.error(t('فشل الترجمة', 'Translation failed'))
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
        toast.success(t(`تم استيراد ${data.count} كلمة بنجاح!`, `Successfully imported ${data.count} words!`))
        fetchWords()
        setShowImportForm(false)
      }
    } catch (error) {
      console.error('Import error:', error)
      toast.error(t('فشل استيراد الكلمات', 'Failed to import words'))
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
        <h2 className="text-3xl font-bold text-[#10B981] mb-6">
          {t('كلماتي', 'My words')}
        </h2>
        <Alert variant="warning">
          <p>{t('قم بتفعيل حسابك للوصول لهذه الميزة', 'Activate your account to access this feature')}</p>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6" dir={localeDirection(language)}>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
          {t('كلماتي', 'My words')}
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
                {selectedWords.size === words.length ? t('إلغاء تحديد الكل', 'Deselect all') : t('تحديد الكل', 'Select all')}
              </Button>
              {selectedWords.size > 0 && (
                <Button
                  variant="outline"
                  onClick={handleDeleteSelected}
                  size="sm"
                  className="border-red-500 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t(`حذف المحدد (${selectedWords.size})`, `Delete selected (${selectedWords.size})`)}
                </Button>
              )}
            </>
          )}
          <Button
            variant="outline"
            onClick={() => setShowImportForm(!showImportForm)}
          >
            <Upload className="h-4 w-4 mr-2" />
            {t('استيراد', 'Import')}
          </Button>
          <Button
            variant="outline"
            onClick={() => exportWordsToExcel(words.filter(w => !w.known), 'unknown-words.xlsx', true)}
            disabled={words.filter(w => !w.known).length === 0}
          >
            <FileDown className="h-4 w-4 mr-2" />
            {t('تصدير الكلمات غير المعروفة', 'Export unknown')}
          </Button>
          <Button
            variant="outline"
            onClick={() => exportWordsToExcel(words, 'all-words.xlsx')}
            disabled={words.length === 0}
          >
            <FileDown className="h-4 w-4 mr-2" />
            {t('تصدير الكل', 'Export all')}
          </Button>
          <Button
            variant="primary"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('أضف كلمة', 'Add word')}
          </Button>
        </div>
      </div>

      {showImportForm && (
        <Card variant="elevated">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {t('استيراد الكلمات', 'Import words')}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {t('ارفع ملفاً نصياً يحتوي على كلمة إنجليزية واحدة في كل سطر (بحد أقصى 100 كلمة). ستُترجم الكلمات تلقائياً إلى العربية.', 'Upload a text file with one English word per line (max 100 words). Words will be automatically translated into Arabic.')}
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
                {t('جارٍ استيراد الكلمات وترجمتها...', 'Importing and translating words...')}
              </p>
            </div>
          )}
        </Card>
      )}

      {showAddForm && (
        <Card variant="elevated">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('أضف كلمة جديدة', 'Add new word')}</h3>
          <div className="space-y-4">
            <Input
              label={t('الكلمة بالإنجليزية', 'English word')}
              value={newWord.englishWord}
              onChange={(e) => setNewWord({ ...newWord, englishWord: e.target.value })}
              placeholder="e.g., Hello"
            />
            <div>
              <Input
                label={t('المعنى بالعربية', 'Arabic meaning')}
                value={newWord.arabicMeaning}
                onChange={(e) => setNewWord({ ...newWord, arabicMeaning: e.target.value })}
                placeholder={t('مثال: مرحباً', 'e.g., مرحباً')}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleTranslate}
                disabled={!newWord.englishWord || translating}
                className="mt-2"
              >
                <Languages className="h-4 w-4 mr-2" />
                {translating ? t('جارٍ الترجمة...', 'Translating...') : t('ترجمة تلقائية', 'Auto translate')}
              </Button>
            </div>
            <Input
              label={t('جملة توضيحية (اختياري)', 'Example sentence (optional)')}
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
                {submitting ? t('جارٍ الإضافة...', 'Adding...') : t('إضافة', 'Add')}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowAddForm(false)}
              >
                {t('إلغاء', 'Cancel')}
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
          <p>{t('لم تقم بحفظ أي كلمات بعد. ابدأ بإضافة كلمات لبناء مفرداتك!', 'No words saved yet. Start adding words to build your vocabulary!')}</p>
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
                        {t('معروفة', 'Known')}
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
                          {t('إلغاء علامة معروفة', 'Mark unknown')}
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4 mr-1" />
                          {t('تعليم كمعروفة', 'Mark known')}
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
          {t(`إجمالي الكلمات: ${words.length} | معروفة: ${words.filter(w => w.known).length}`, `Total words: ${words.length} | Known: ${words.filter(w => w.known).length}`)}
        </p>
      </div>

      <ConfirmModal
        isOpen={confirmModal.open}
        onClose={() => setConfirmModal({ open: false, type: 'single' })}
        onConfirm={confirmModal.type === 'bulk' ? doDeleteSelected : doDeleteWord}
        title={t('حذف الكلمة', 'Delete word')}
        message={
          confirmModal.type === 'bulk'
            ? t(`هل أنت متأكد من حذف ${selectedWords.size} كلمة؟ لا يمكن التراجع عن هذا الإجراء.`, `Are you sure you want to delete ${selectedWords.size} words? This cannot be undone.`)
            : t('هل أنت متأكد من حذف هذه الكلمة؟ لا يمكن التراجع عن هذا الإجراء.', 'Are you sure you want to delete this word? This cannot be undone.')
        }
        confirmText={t('حذف', 'Delete')}
        cancelText={t('إلغاء', 'Cancel')}
        variant="danger"
      />
    </div>
  )
}
