declare global {
  interface Window {
    puter: {
      ai: {
        chat: (
          messages: Array<{role: string, content: string}>, 
          options?: {model?: string, stream?: boolean}
        ) => Promise<{message?: {content: string}, text?: string} | AsyncIterable<{text: string}>>
      }
    }
  }
}

export {}
