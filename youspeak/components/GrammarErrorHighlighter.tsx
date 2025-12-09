'use client'

import { useState } from 'react'
import { AlertCircle, X, Plus } from 'lucide-react'
import Button from './ui/Button'

interface GrammarError {
  text: string
  correction: string
  explanation: string
}

interface GrammarErrorHighlighterProps {
  studentAnswer: string
  errors: GrammarError[]
  onErrorsChange: (errors: GrammarError[]) => void
  readonly?: boolean
}

export default function GrammarErrorHighlighter({
  studentAnswer,
  errors,
  onErrorsChange,
  readonly = false
}: GrammarErrorHighlighterProps) {
  const [selectedText, setSelectedText] = useState('')
  const [showAddError, setShowAddError] = useState(false)
  const [newError, setNewError] = useState({ text: '', correction: '', explanation: '' })

  const handleTextSelection = () => {
    const selection = window.getSelection()
    const text = selection?.toString().trim()
    if (text && !readonly) {
      setSelectedText(text)
      setNewError({ ...newError, text })
      setShowAddError(true)
    }
  }

  const handleAddError = () => {
    if (newError.text && newError.correction) {
      onErrorsChange([...errors, newError])
      setNewError({ text: '', correction: '', explanation: '' })
      setShowAddError(false)
      setSelectedText('')
    }
  }

  const handleRemoveError = (index: number) => {
    onErrorsChange(errors.filter((_, i) => i !== index))
  }

  const escapeHtml = (text: string) => {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }

  const renderHighlightedText = () => {
    const parts: Array<{ text: string; isError: boolean; errorIndex?: number }> = []
    let lastIndex = 0
    
    const sortedErrors = errors.map((err, idx) => ({
      ...err,
      index: idx,
      position: studentAnswer.indexOf(err.text)
    })).filter(e => e.position !== -1).sort((a, b) => a.position - b.position)
    
    sortedErrors.forEach(error => {
      if (error.position > lastIndex) {
        parts.push({ text: studentAnswer.slice(lastIndex, error.position), isError: false })
      }
      parts.push({ text: error.text, isError: true, errorIndex: error.index })
      lastIndex = error.position + error.text.length
    })
    
    if (lastIndex < studentAnswer.length) {
      parts.push({ text: studentAnswer.slice(lastIndex), isError: false })
    }
    
    return parts
  }

  const highlightedParts = renderHighlightedText()

  return (
    <div className="space-y-4">
      <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            Student Answer / إجابة الطالب
          </h4>
          {!readonly && (
            <span className="text-xs text-gray-600 dark:text-gray-400">
              حدد النص لإضافة خطأ / Select text to add error
            </span>
          )}
        </div>
        <div
          className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap select-text"
          onMouseUp={handleTextSelection}
        >
          {highlightedParts.map((part, index) => 
            part.isError ? (
              <mark
                key={index}
                className="bg-red-200 dark:bg-red-900 cursor-pointer relative group"
                title={`Error: ${errors[part.errorIndex!].correction}`}
              >
                {part.text}
                <span className="hidden group-hover:block absolute bottom-full left-0 mb-2 p-2 bg-gray-900 text-white text-xs rounded shadow-lg w-64 z-10">
                  <strong className="text-green-400">✓ {errors[part.errorIndex!].correction}</strong>
                  {errors[part.errorIndex!].explanation && (
                    <span className="block text-gray-300 mt-1">{errors[part.errorIndex!].explanation}</span>
                  )}
                </span>
              </mark>
            ) : (
              <span key={index}>{part.text}</span>
            )
          )}
        </div>
      </div>

      {!readonly && showAddError && (
        <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h5 className="font-semibold text-blue-900 dark:text-blue-100">
              Add Grammar Error / إضافة خطأ نحوي
            </h5>
            <button
              onClick={() => setShowAddError(false)}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                Incorrect Text / النص الخاطئ
              </label>
              <input
                type="text"
                value={newError.text}
                onChange={(e) => setNewError({ ...newError, text: e.target.value })}
                className="w-full px-3 py-2 border border-blue-300 dark:border-blue-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                placeholder="The selected text..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                Correction / التصحيح *
              </label>
              <input
                type="text"
                value={newError.correction}
                onChange={(e) => setNewError({ ...newError, correction: e.target.value })}
                className="w-full px-3 py-2 border border-blue-300 dark:border-blue-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                placeholder="The correct form..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                Explanation (Optional) / التوضيح (اختياري)
              </label>
              <textarea
                value={newError.explanation}
                onChange={(e) => setNewError({ ...newError, explanation: e.target.value })}
                className="w-full px-3 py-2 border border-blue-300 dark:border-blue-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                placeholder="Why this is incorrect..."
                rows={2}
              />
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={handleAddError}
              disabled={!newError.text || !newError.correction}
            >
              <Plus className="w-3 h-3 mr-1" />
              Add Error / إضافة
            </Button>
          </div>
        </div>
      )}

      {errors.length > 0 && (
        <div className="space-y-2">
          <h5 className="font-semibold text-gray-900 dark:text-gray-100">
            Grammar Errors ({errors.length}) / الأخطاء النحوية
          </h5>
          {errors.map((error, index) => (
            <div
              key={index}
              className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-3 flex items-start justify-between"
            >
              <div className="flex-1">
                <p className="text-sm text-gray-900 dark:text-gray-100">
                  <span className="line-through text-red-600 dark:text-red-400">{error.text}</span>
                  {' → '}
                  <span className="text-green-600 dark:text-green-400 font-semibold">{error.correction}</span>
                </p>
                {error.explanation && (
                  <p className="text-xs text-gray-700 dark:text-gray-300 mt-1">{error.explanation}</p>
                )}
              </div>
              {!readonly && (
                <button
                  onClick={() => handleRemoveError(index)}
                  className="text-red-600 dark:text-red-400 hover:text-red-800 ml-2"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
