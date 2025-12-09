'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import ChatBox from '@/components/ChatBox'
import ConversationsList from '@/components/ConversationsList'
import { MessageCircle, ArrowRight, Plus, X, Send } from 'lucide-react'

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#004E89] to-[#1A5F7A]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">جاري التحميل...</p>
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
      case 'TEACHER': return { text: 'مدرس', icon: '👨‍🏫', color: 'bg-purple-500/20 text-purple-700 border border-purple-300' }
      case 'STUDENT': return { text: 'طالب', icon: '👨‍🎓', color: 'bg-blue-500/20 text-blue-700 border border-blue-300' }
      case 'ADMIN': return { text: 'مدير', icon: '👨‍💼', color: 'bg-red-500/20 text-red-700 border border-red-300' }
      default: return { text: 'مستخدم', icon: '👤', color: 'bg-gray-500/20 text-gray-700 border border-gray-300' }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#004E89] to-[#1A5F7A] text-white p-4 sm:p-6 shadow-2xl border-b-4 border-[#003B6F]">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/')}
              className="hover:bg-white/20 p-2 rounded-lg transition-all duration-200 hover:scale-110"
            >
              <ArrowRight className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold flex items-center gap-2">
                💬 المحادثات الفورية
              </h1>
              <p className="text-sm text-gray-200 mt-1">تواصل مع المدرسين والطلاب بسهولة</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto h-[calc(100vh-120px)] p-4 flex gap-4">
        {/* Left Sidebar - Conversations List */}
        <div className="hidden lg:flex lg:w-80 flex-col gap-4">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col h-full border-2 border-slate-200">
            {/* Sidebar Header */}
            <div className="bg-gradient-to-r from-[#004E89] to-[#1A5F7A] text-white p-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                <h2 className="font-bold text-lg">محادثاتك</h2>
              </div>
              <button
                onClick={() => setShowNewChatModal(true)}
                className="bg-white text-[#004E89] hover:bg-gray-100 p-2 rounded-lg transition-all duration-200 hover:scale-110 font-bold"
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
            <div className="lg:hidden bg-gradient-to-r from-[#004E89] to-[#1A5F7A] text-white rounded-2xl p-4 flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold text-lg">
                  {selectedUser.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold">{selectedUser.name}</p>
                  <p className="text-xs text-gray-200">{selectedUser.email}</p>
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
            <div className="flex-1 bg-white rounded-2xl shadow-2xl flex flex-col items-center justify-center text-center border-2 border-slate-200 p-6 lg:p-12">
              <div className="mb-6 p-8 bg-gradient-to-br from-[#004E89]/10 to-[#1A5F7A]/10 rounded-full">
                <Send className="w-16 h-16 text-[#004E89]" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">لا توجد محادثة نشطة</h2>
              <p className="text-gray-600 mb-8 text-base max-w-md">اختر محادثة من القائمة أو ابدأ محادثة جديدة للتواصل</p>
              
              <button
                onClick={() => setShowNewChatModal(true)}
                className="bg-gradient-to-r from-[#004E89] to-[#1A5F7A] text-white px-8 py-4 rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105 flex items-center gap-3 font-bold text-lg"
              >
                <Plus className="h-6 w-6" />
                ابدأ محادثة جديدة
              </button>

              {/* Quick Info */}
              <div className="mt-12 grid grid-cols-3 gap-4 w-full max-w-sm">
                <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                  <p className="text-2xl font-bold text-blue-600">💬</p>
                  <p className="text-xs text-gray-600 mt-2">محادثات فورية</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-200">
                  <p className="text-2xl font-bold text-purple-600">🔐</p>
                  <p className="text-xs text-gray-600 mt-2">آمنة وخاصة</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
                  <p className="text-2xl font-bold text-green-600">⚡</p>
                  <p className="text-xs text-gray-600 mt-2">سريعة</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border-2 border-slate-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#004E89] to-[#1A5F7A] text-white p-6 flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="text-2xl font-bold">اختر محادثة جديدة</h2>
                <p className="text-sm text-gray-200 mt-1">اختر الشخص الذي تريد التحدث معه</p>
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
                  <div className="w-12 h-12 border-4 border-[#004E89] border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : availableContacts.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 font-semibold text-lg">لا توجد جهات اتصال متاحة</p>
                  <p className="text-sm text-gray-500 mt-2">تأكد من أنك تملك اشتراكًا نشطًا</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {availableContacts.map((contact) => {
                    const badge = getRoleBadge(contact.role)
                    return (
                      <button
                        key={contact.id}
                        onClick={() => handleSelectContact(contact)}
                        className="w-full p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200 rounded-xl hover:from-blue-50 hover:to-blue-100 hover:border-[#004E89] transition-all duration-200 text-left hover:shadow-md group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-gradient-to-br from-[#004E89] to-[#1A5F7A] rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0 group-hover:scale-110 transition-transform">
                            {contact.name?.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-bold text-gray-900 truncate text-base">
                                {contact.name}
                              </h4>
                              <span className={`px-3 py-1 text-xs font-bold rounded-full whitespace-nowrap ${badge.color}`}>
                                {badge.icon} {badge.text}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 truncate">{contact.email}</p>
                          </div>
                          <div className="text-[#004E89] text-xl group-hover:translate-x-1 transition-transform">→</div>
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
