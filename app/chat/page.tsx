'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import ChatBox from '@/components/ChatBox'
import ConversationsList from '@/components/ConversationsList'
import { MessageCircle, ArrowRight, Plus, X, Send, Users } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export default function ChatPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [showNewChatModal, setShowNewChatModal] = useState(false)
  const [availableContacts, setAvailableContacts] = useState<any[]>([])
  const [loadingContacts, setLoadingContacts] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-[#f4f1e8]">
        <div className="text-center">
          <div className="w-11 h-11 border-2 border-[#174c3c]/20 border-t-[#174c3c] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#19372d] text-sm font-medium">جاري تحميل مساحة المحادثة...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  useEffect(() => {
    if (showNewChatModal) {
      fetchAvailableContacts()
    }
  }, [showNewChatModal])

  async function fetchAvailableContacts() {
    setLoadingContacts(true)
    try {
      const res = await fetch('/api/chat/available-contacts')
      if (res.ok) {
        const data = await res.json()
        setAvailableContacts(data.contacts || [])
      }
    } catch (error) {
      console.error('Error fetching contacts:', error)
    } finally {
      setLoadingContacts(false)
    }
  }

  function handleSelectContact(contact: any) {
    setSelectedUser(contact)
    setShowNewChatModal(false)
  }

  function getRoleBadge(role: string) {
    switch (role) {
      case 'TEACHER': return { text: 'مدرس', color: 'bg-[#e8eee7] text-[#174c3c] border border-[#bed0bf]' }
      case 'STUDENT': return { text: 'طالب', color: 'bg-[#f1eee4] text-[#585c4f] border border-[#d6d0bd]' }
      case 'ADMIN': return { text: 'مدير', color: 'bg-[#f1e8df] text-[#8a513e] border border-[#dfcabc]' }
      default: return { text: 'مستخدم', color: 'bg-[#f1eee4] text-[#585c4f] border border-[#d6d0bd]' }
    }
  }

  return (
    <div className="min-h-[100dvh] bg-[#f4f1e8] text-[#19372d]" dir="rtl">
      {/* Header */}
      <div className="bg-[#f7f5ed] border-b border-[#d6d2c3] p-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/')}
              className="hover:bg-[#e8eee7] p-2 transition-colors"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
            <div>
              <p className="text-[10px] tracking-[.2em] text-[#718075] uppercase mb-1">Be Fluent / Messages</p>
              <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                المحادثات
              </h1>
              <p className="text-sm text-[#69756c] mt-1">مساحة خاصة للتواصل مع معلّمك وفريق التعلّم</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto min-h-[calc(100dvh-112px)] p-3 sm:p-5 flex gap-4">
        {/* Left Sidebar - Conversations List */}
        <div className="hidden lg:flex lg:w-80 flex-col gap-4">
          <div className="bg-[#fbfaf5] border border-[#d6d2c3] overflow-hidden flex flex-col h-full">
            {/* Sidebar Header */}
            <div className="bg-[#e8eee7] border-b border-[#d6d2c3] p-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-[#174c3c]" />
                <h2 className="font-bold text-base">محادثاتك</h2>
              </div>
              <button
                onClick={() => setShowNewChatModal(true)}
                className="bg-[#174c3c] text-[#f7f5ed] hover:bg-[#0f392c] p-2 transition-colors font-bold"
                title="محادثة جديدة"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
            {/* Conversations */}
            <div className="flex-1 overflow-y-auto">
              <ConversationsList
                onSelectConversation={setSelectedUser}
                selectedUserId={selectedUser?.id}
              />
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Mobile Header - Show selected user */}
          {selectedUser && (
            <div className="lg:hidden bg-[#174c3c] text-[#f7f5ed] p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#e8eee7] text-[#174c3c] rounded-full flex items-center justify-center font-bold text-lg">
                  {selectedUser.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold">{selectedUser.name}</p>
                  <p className="text-xs text-[#d8e0d7]">{selectedUser.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}

          {selectedUser ? (
            <ChatBox otherUser={selectedUser} onClose={() => setSelectedUser(null)} />
          ) : (
            <div className="flex-1 bg-[#fbfaf5] border border-[#d6d2c3] flex flex-col items-center justify-center text-center p-6 lg:p-12">
              <div className="mb-6 p-6 bg-[#e8eee7] border border-[#ccd6ca]">
                <Send className="w-12 h-12 text-[#174c3c]" />
              </div>
              <h2 className="text-2xl font-bold text-[#19372d] mb-3">ابدأ من حيث يهم</h2>
              <p className="text-[#69756c] mb-8 text-base max-w-md">اختر محادثة من القائمة أو ابدأ محادثة جديدة للتواصل المباشر.</p>
              
              <button
                onClick={() => setShowNewChatModal(true)}
                className="bg-[#174c3c] text-[#f7f5ed] px-7 py-3 hover:bg-[#0f392c] transition-colors flex items-center gap-3 font-bold"
              >
                <Plus className="h-6 w-6" />
                ابدأ محادثة جديدة
              </button>

              {/* Quick Info */}
              <div className="mt-12 flex items-center gap-3 text-xs text-[#69756c]">
                <Users className="h-4 w-4 text-[#174c3c]" />
                <span>المراسلات خاصة ومتصلة بحسابك في الأكاديمية</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#fbfaf5] max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-[#d6d2c3]">
            {/* Modal Header */}
            <div className="bg-[#174c3c] text-[#f7f5ed] p-6 flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="text-2xl font-bold">اختر محادثة جديدة</h2>
                <p className="text-sm text-[#d8e0d7] mt-1">اختر الشخص الذي تريد التحدث معه</p>
              </div>
              <button
                onClick={() => setShowNewChatModal(false)}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {loadingContacts ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-10 h-10 border-2 border-[#174c3c]/20 border-t-[#174c3c] rounded-full animate-spin"></div>
                </div>
              ) : availableContacts.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle className="h-16 w-16 text-[#b6c3b6] mx-auto mb-4" />
                  <p className="text-[#19372d] font-semibold text-lg">لا توجد جهات اتصال متاحة</p>
                  <p className="text-sm text-[#69756c] mt-2">تأكد من أن اشتراكك نشط.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {availableContacts.map((contact) => {
                    const badge = getRoleBadge(contact.role)
                    return (
                      <button
                        key={contact.id}
                        onClick={() => handleSelectContact(contact)}
                        className="w-full p-4 bg-[#f7f5ed] border border-[#ded9ca] hover:bg-[#edf1e9] hover:border-[#8fa493] transition-colors text-right group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-[#174c3c] rounded-full flex items-center justify-center text-[#f7f5ed] text-lg font-bold flex-shrink-0 group-hover:scale-105 transition-transform">
                            {contact.name?.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-bold text-[#19372d] truncate text-base">
                                {contact.name}
                              </h4>
                              <span className={`px-3 py-1 text-xs font-bold rounded-full whitespace-nowrap ${badge.color}`}>
                                {badge.text}
                              </span>
                            </div>
                            <p className="text-sm text-[#69756c] truncate" dir="ltr">{contact.email}</p>
                          </div>
                          <ArrowRight className="text-[#174c3c] h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
