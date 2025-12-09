'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, Loader2 } from 'lucide-react'
import { useSession } from 'next-auth/react'

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
      case 'TEACHER': return { text: 'مدرس', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' }
      case 'STUDENT': return { text: 'طالب', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' }
      case 'ADMIN': return { text: 'مدير', color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' }
      default: return { text: 'مستخدم', color: 'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300' }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-[#004E89]" />
      </div>
    )
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-white text-gray-600 p-8">
        <MessageCircle className="w-16 h-16 mb-4" />
        <p className="text-lg font-medium">لا توجد محادثات</p>
        <p className="text-sm text-center mt-2">ابدأ محادثة جديدة مع مدرسك أو طلابك</p>
      </div>
    )
  }

  return (
    <div className="space-y-1 p-2 bg-white">
      {conversations.map((conv) => {
        const badge = getRoleBadge(conv.user.role)
        const isSelected = selectedUserId === conv.user.id

        return (
          <button
            key={conv.user.id}
            onClick={() => onSelectConversation(conv.user)}
            className={`w-full p-4 rounded-lg hover:bg-gray-100 transition-all text-right border ${
              isSelected ? 'bg-blue-50 border-[#004E89]' : 'bg-white border-gray-300'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-700 dark:from-primary-500 dark:to-primary-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                {conv.user.profilePhoto ? (
                  <img src={conv.user.profilePhoto} alt={conv.user.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  conv.user.name.charAt(0).toUpperCase()
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 truncate">{conv.user.name}</h3>
                  {conv.unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
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
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 truncate" dir="rtl">
                      {conv.lastMessage.fromUserId === session?.user?.id && 'أنت: '}
                      {conv.lastMessage.content}
                    </p>
                    <span className="text-xs text-neutral-400 dark:text-neutral-500 flex-shrink-0 mr-2">
                      {new Date(conv.lastMessage.createdAt).toLocaleDateString('ar-EG', {
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