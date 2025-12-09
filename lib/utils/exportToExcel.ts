import * as XLSX from 'xlsx'

interface Word {
  englishWord: string
  arabicMeaning: string
  exampleSentence: string | null
  known: boolean
  createdAt: string
}

export function exportWordsToExcel(words: Word[], filename: string = 'my-words.xlsx', onlyUnknown: boolean = false) {
  const filteredWords = onlyUnknown ? words.filter(w => !w.known) : words
  
  const data = filteredWords.map(word => ({
    'English Word': word.englishWord,
    'Arabic Meaning': word.arabicMeaning,
    'Example Sentence': word.exampleSentence || '',
    'Status': word.known ? 'Known' : 'Unknown',
    'Added Date': new Date(word.createdAt).toLocaleDateString('en-GB')
  }))

  const worksheet = XLSX.utils.json_to_sheet(data)
  
  const colWidths = [
    { wch: 20 },
    { wch: 20 },
    { wch: 40 },
    { wch: 10 },
    { wch: 15 }
  ]
  worksheet['!cols'] = colWidths

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Words')

  XLSX.writeFile(workbook, filename)
}
