'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, Loader2 } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useTheme } from '@/lib/contexts/ThemeContext'
import { localeText } from '@/lib/locale'

interface Conversation {
  user: {
    id: string
    name: string
    email: string
    role: string
    profilePhoto: string | null
  }
  lastMessage: {
    content: string
    createdAt: string
    fromUserId: string
  } | null
  unreadCount: number
}

interface ConversationsListProps {
  onSelectConversation: (user: Conversation['user']) => void
  selectedUserId?: string
}

export default function ConversationsList({ onSelectConversation, selectedUserId }: ConversationsListProps) {
  const { data: session } = useSession()
  const { language } = useTheme()
  const t = (ar: string, en: string) => localeText(language, ar, en)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await fetch('/api/chat/conversations')
        if (res.ok) {
          const data = await res.json()
          setConversations(data.conversations || [])
        }
      } catch (error) {
        console.error('Error fetching conversations:', error)
      } finally {
        setLoading(false)
      }
    }

    if (session?.user?.id) {
      fetchConversations()
      const interval = setInterval(fetchConversations, 10000)
      return () => clearInterval(interval)
    }
  }, [session?.user?.id])

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'TEACHER': return { text: t('مدرس', 'Teacher'), color: 'bg-[#e8eee7] text-[#174c3c]' }
      case 'STUDENT': return { text: t('طالب', 'Student'), color: 'bg-[#f1eee4] text-[#585c4f]' }
      case 'ADMIN': return { text: t('مدير', 'Admin'), color: 'bg-[#f1e8df] text-[#8a513e]' }
      default: return { text: t('مستخدم', 'User'), color: 'bg-[#f1eee4] text-[#585c4f]' }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-[#fbfaf5]">
        <Loader2 className="w-8 h-8 animate-spin text-[#174c3c]" />
      </div>
    )
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#fbfaf5] text-[#69756c] p-8">
        <MessageCircle className="w-14 h-14 mb-4 text-[#afbdaf]" />
        <p className="text-lg font-medium text-[#19372d]">{t('لا توجد محادثات', 'No conversations')}</p>
        <p className="text-sm text-center mt-2">{t('ابدأ محادثة جديدة مع مدرسك أو طلابك', 'Start a new conversation with your teacher or classmates')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-1 p-2 bg-[#fbfaf5]">
      {conversations.map((conv) => {
        const badge = getRoleBadge(conv.user.role)
        const isSelected = selectedUserId === conv.user.id

        return (
          <button
            key={conv.user.id}
            onClick={() => onSelectConversation(conv.user)}
            className={`w-full p-4 hover:bg-[#edf1e9] transition-colors text-start border ${
              isSelected ? 'bg-[#e8eee7] border-[#8fa493]' : 'bg-[#fbfaf5] border-transparent'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-[#174c3c] rounded-full flex items-center justify-center text-[#f7f5ed] font-bold flex-shrink-0">
                {conv.user.profilePhoto ? (
                  <img src={conv.user.profilePhoto} alt={conv.user.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  conv.user.name.charAt(0).toUpperCase()
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-[#19372d] truncate">{conv.user.name}</h3>
                  {conv.unreadCount > 0 && (
                      <span className="bg-[#a65b45] text-[#f7f5ed] text-xs font-bold px-2 py-1 rounded-full">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${badge.color}`}>
                    {badge.text}
                  </span>
                </div>

                {conv.lastMessage && (
                  <div className="flex items-baseline justify-between">
                    <p className="text-sm text-[#69756c] truncate" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                      {conv.lastMessage.fromUserId === session?.user?.id && `${t('أنت:', 'You:')} `}
                      {conv.lastMessage.content}
                    </p>
                    <span className="text-xs text-[#8a948b] flex-shrink-0 mr-2">
                      {new Date(conv.lastMessage.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}