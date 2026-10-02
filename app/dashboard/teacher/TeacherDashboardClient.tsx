'use client'

import Image from 'next/image'
import { useState, useEffect, useCallback } from 'react'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Home, Users, Calendar, BookOpen, MessageCircle, LogOut, Shield, FileText, Menu, X } from 'lucide-react'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import ThemeToggle from '@/components/ThemeToggle'
import LanguageToggle from '@/components/LanguageToggle'
import { useTheme } from '@/lib/contexts/ThemeContext'
import { localeDirection, localeText } from '@/lib/locale'
import ChatBox from '@/components/ChatBox'
import ConversationsList from '@/components/ConversationsList'
import HomeTab from './components/HomeTab'
import StudentsTab from './components/StudentsTab'
import SessionsTab from './components/SessionsTab'
import AssignmentsTab from './components/AssignmentsTab'
import WritingTestsTab from './components/WritingTestsTab'
import ManuscriptsTab from './components/ManuscriptsTab'

interface TeacherDashboardClientProps {
  user: {
    name: string
    email: string
    teacherProfileId?: string
  }
}

async function ensureTeacherProfile() {
  const response = await fetch('/api/teacher/setup', { method: 'POST' })
  if (!response.ok) throw new Error('TEACHER_PROFILE_SETUP_FAILED')
  const data: unknown = await response.json()
  if (!data || typeof data !== 'object' || !('teacherProfileId' in data) || typeof data.teacherProfileId !== 'string' || !data.teacherProfileId) {
    throw new Error('TEACHER_PROFILE_SETUP_FAILED')
  }
  return data.teacherProfileId
}

export default function TeacherDashboardClient({ user: initialUser }: TeacherDashboardClientProps) {
  const { language } = useTheme()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('home')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState(initialUser)
  const [loading, setLoading] = useState(!initialUser.teacherProfileId)
  const [setupFailed, setSetupFailed] = useState(false)

  const setupTeacherProfile = useCallback(async () => {
    setLoading(true)
    setSetupFailed(false)
    try {
      const teacherProfileId = await ensureTeacherProfile()
      setUser(current => ({ ...current, teacherProfileId }))
    } catch {
      setSetupFailed(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user.teacherProfileId) return
    let active = true
    const createProfile = async () => {
      try {
        const teacherProfileId = await ensureTeacherProfile()
        if (active) setUser(current => ({ ...current, teacherProfileId }))
      } catch {
        if (active) setSetupFailed(true)
      } finally {
        if (active) setLoading(false)
      }
    }
    void createProfile()
    return () => { active = false }
  }, [user.teacherProfileId])

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push('/auth/login')
  }

  const menuItems = [
    { id: 'home', label: localeText(language, 'الرئيسية', 'Home'), icon: Home },
    { id: 'students', label: localeText(language, 'الطلاب', 'Students'), icon: Users },
    { id: 'sessions', label: localeText(language, 'الحصص', 'Sessions'), icon: Calendar },
    { id: 'assignments', label: localeText(language, 'الواجبات', 'Assignments'), icon: BookOpen },
    { id: 'writing-tests', label: localeText(language, 'اختبارات الكتابة', 'Writing tests'), icon: FileText },
    { id: 'manuscripts', label: localeText(language, 'المخطوطات', 'Manuscripts'), icon: BookOpen },
    { id: 'chat', label: localeText(language, 'الدردشة', 'Chat'), icon: MessageCircle },
  ]

  return (
    <div className="min-h-[100dvh] bg-[#f5f7f4] text-[#26332e]" dir={localeDirection(language)}>
      <header className="sticky top-0 z-30 border-b border-[#e0e6e1] bg-white/95">
        <div className="mx-auto flex min-h-[68px] max-w-[1480px] items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <ThemeToggle />
            <button
              aria-label={localeText(language, 'فتح القائمة', 'Open menu')}
              aria-expanded={sidebarOpen}
              className="grid min-h-11 min-w-11 place-items-center rounded-lg border border-[#e0e6e1] text-[#315f49] hover:bg-[#f2f7f2] lg:hidden"
              onClick={() => setSidebarOpen(true)}
              type="button"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-[#247456] text-sm font-black text-white">ب</span>
              <div className="leading-tight">
                <p className="text-sm font-extrabold text-[#26332e]">Be Fluent</p>
                <p className="mt-1 text-[10px] font-semibold text-[#718078]">{localeText(language, 'مساحة المعلم', 'Teacher workspace')}</p>
              </div>
            </div>
            <Link href="/dashboard/admin" className="hidden min-h-10 items-center gap-2 rounded-lg border border-[#e0e6e1] px-3 text-xs font-bold text-[#42634f] hover:bg-[#f3f7f3] sm:flex">
              <Shield className="h-4 w-4" aria-hidden="true" />
              {localeText(language, 'لوحة الإدارة', 'Admin dashboard')}
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-start sm:block">
              <span className="block text-xs font-bold text-[#26332e]">{user.name}</span>
              <span className="text-[11px] text-[#718078]">{localeText(language, 'المساحة التعليمية', 'Teaching workspace')}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="!min-h-11 !rounded-lg !border-[#dce5de] !px-3 !text-[#465a4e] hover:!bg-[#f5f8f5] sm:!px-4"
            >
              <LogOut className="h-4 w-4 sm:ml-2" aria-hidden="true" />
              <span className="hidden sm:inline">{localeText(language, 'تسجيل الخروج', 'Sign out')}</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1480px] px-3 py-4 sm:px-6 sm:py-7">
        <div className="flex gap-5 lg:gap-7">
          {sidebarOpen && (
            <button
              type="button"
              aria-label={localeText(language, 'إغلاق القائمة', 'Close menu')}
              className="fixed inset-0 z-40 bg-[#172b21]/35 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
          <aside
            className={`fixed inset-y-0 ${language === 'ar' ? 'right-0' : 'left-0'} z-50 w-[min(330px,88vw)] overflow-y-auto bg-white p-4 transition-transform duration-200 lg:sticky lg:top-[88px] lg:z-0 lg:h-[calc(100dvh-112px)] lg:w-[258px] lg:shrink-0 lg:translate-x-0 lg:rounded-xl lg:border lg:border-[#e0e6e1] lg:p-0 ${
              sidebarOpen ? 'translate-x-0' : language === 'ar' ? 'translate-x-full lg:translate-x-0' : '-translate-x-full lg:translate-x-0'
            }`}
          >
            <div className="flex min-h-[94px] items-center justify-between border-b border-[#e8ece8] px-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#e8f1e9] text-base font-extrabold text-[#286547]">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-[#29362f]">{user.name}</p>
                   <p className="mt-1 text-xs text-[#718078]">{localeText(language, 'مدرس', 'Teacher')}</p>
                </div>
              </div>
              <button
                type="button"
                aria-label={localeText(language, 'إغلاق القائمة', 'Close menu')}
                className="grid min-h-11 min-w-11 place-items-center rounded-lg text-[#68756e] hover:bg-[#f3f6f3] lg:hidden"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <nav className="space-y-1 p-3" aria-label={localeText(language, 'التنقل الرئيسي للمعلم', 'Main teacher navigation')}>
              <p className="px-3 pb-2 pt-3 text-[11px] font-bold text-[#849087]">{localeText(language, 'مساحة العمل', 'Workspace')}</p>
              {menuItems.map((item) => {
                const Icon = item.icon
                const selected = activeTab === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-current={selected ? 'page' : undefined}
                    onClick={() => {
                      setActiveTab(item.id)
                      setSidebarOpen(false)
                    }}
                    className={`flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-start text-sm transition-colors ${
                      selected
                        ? 'bg-[#edf5ef] font-bold text-[#225d41]'
                        : 'text-[#5c6961] hover:bg-[#f5f7f5] hover:text-[#225d41]'
                    }`}
                  >
                    <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                    <span>{item.label}</span>
                  </button>
                )
              })}
              <Link
                href="/dashboard/teacher/feedback"
                onClick={() => setSidebarOpen(false)}
                className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-start text-sm text-[#5c6961] transition-colors hover:bg-[#f5f7f5] hover:text-[#225d41]"
              >
                <FileText className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                <span>{localeText(language, 'ملاحظات الحصص', 'Feedback')}</span>
              </Link>
              <Link
                href="/dashboard/teacher/staff"
                onClick={() => setSidebarOpen(false)}
                className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-start text-sm text-[#5c6961] transition-colors hover:bg-[#f5f7f5] hover:text-[#225d41]"
              >
                <Users className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                <span>{localeText(language, 'حسابات الموظفين', 'Employee accounts')}</span>
              </Link>
            </nav>
          </aside>

          <main className="min-w-0 flex-1">
            {loading && !user.teacherProfileId ? (
              <div className="space-y-4" aria-busy="true" aria-label={localeText(language, 'جارٍ تجهيز مساحة المعلم', 'Preparing teacher workspace')}>
                <div className="h-8 w-52 animate-pulse rounded bg-[#e6ece7]" />
                <div className="h-28 rounded-xl border border-[#e3e9e4] bg-white" />
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="h-40 rounded-xl border border-[#e3e9e4] bg-white" />
                  <div className="h-40 rounded-xl border border-[#e3e9e4] bg-white" />
                </div>
              </div>
            ) : !user.teacherProfileId && setupFailed ? (
              <section className="rounded-xl border border-[#ead9d5] bg-white p-6 sm:p-8" role="alert">
                <h1 className="text-lg font-bold text-[#26332e]">{localeText(language, 'تعذر تجهيز مساحة المعلم', 'Could not prepare teacher workspace')}</h1>
                <p className="mt-1 text-sm leading-6 text-[#68756e]">{localeText(language, 'لم نتمكن من تجهيز ملف المعلم الآن. حاول مرة أخرى.', 'We could not prepare the teacher profile. Please try again.')}</p>
                <button
                  type="button"
                  onClick={() => void setupTeacherProfile()}
                  className="mt-4 inline-flex min-h-11 items-center justify-center rounded-lg bg-[#247456] px-4 text-sm font-bold text-white hover:bg-[#19583f]"
                >
                  {localeText(language, 'إعادة المحاولة', 'Try again')}
                </button>
              </section>
            ) : (
              <>
                {activeTab === 'home' && user.teacherProfileId && <HomeTab teacherProfileId={user.teacherProfileId} setActiveTab={setActiveTab} />}
                {activeTab === 'students' && user.teacherProfileId && <StudentsTab teacherProfileId={user.teacherProfileId} />}
                {activeTab === 'sessions' && user.teacherProfileId && <SessionsTab teacherProfileId={user.teacherProfileId} />}
                {activeTab === 'assignments' && user.teacherProfileId && <AssignmentsTab teacherProfileId={user.teacherProfileId} />}
                {activeTab === 'writing-tests' && user.teacherProfileId && <WritingTestsTab teacherProfileId={user.teacherProfileId} />}
                {activeTab === 'manuscripts' && user.teacherProfileId && <ManuscriptsTab teacherProfileId={user.teacherProfileId} />}
                {activeTab === 'chat' && <ChatTab />}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

type ChatContact = {
  id: string
  role: string
  name: string
  profilePhoto?: string | null
}

function ChatTab() {
  const { language } = useTheme()
  const [selectedUser, setSelectedUser] = useState<ChatContact | null>(null)
  const [showNewChatModal, setShowNewChatModal] = useState(false)
  const [availableContacts, setAvailableContacts] = useState<ChatContact[]>([])
  const [loadingContacts, setLoadingContacts] = useState(false)

  const fetchAvailableContacts = async () => {
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

  const handleNewChat = () => {
    fetchAvailableContacts()
    setShowNewChatModal(true)
  }

  const handleSelectContact = (contact: ChatContact) => {
    setSelectedUser(contact)
    setShowNewChatModal(false)
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'STUDENT': return { text: localeText(language, 'طالب', 'Student'), color: 'bg-blue-100 text-blue-700' }
      case 'ADMIN': return { text: localeText(language, 'مدير', 'Manager'), color: 'bg-red-100 text-red-700' }
      default: return { text: localeText(language, 'مستخدم', 'User'), color: 'bg-gray-100 text-gray-700' }
    }
  }

  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-bold text-[#10B981] mb-4 sm:mb-6">
        {localeText(language, 'الدردشة', 'Chat')}
      </h2>
      <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-250px)] sm:h-[calc(100vh-300px)]">
        <div className="lg:flex-none lg:w-1/3">
          <Card variant="elevated" padding="none" className="h-full overflow-hidden">
            <div className="bg-gradient-to-r from-[#10B981] to-[#059669] p-4 text-white flex justify-between items-center">
              <h3 className="font-bold text-lg">{localeText(language, 'المحادثات', 'Conversations')}</h3>
              <button
                onClick={handleNewChat}
                className="bg-white text-[#10B981] px-3 py-1 rounded-lg text-sm font-bold hover:bg-gray-100 transition-colors"
              >
                + {localeText(language, 'محادثة جديدة', 'New chat')}
              </button>
            </div>
            <div className="overflow-y-auto h-[calc(100%-60px)]">
              <ConversationsList 
                onSelectConversation={setSelectedUser}
                selectedUserId={selectedUser?.id}
              />
            </div>
          </Card>
        </div>
        <div className="lg:flex-1 h-full">
          {selectedUser ? (
            <ChatBox 
              otherUser={selectedUser}
              onClose={() => setSelectedUser(null)}
            />
          ) : (
            <Card variant="elevated" className="h-full flex flex-col items-center justify-center text-gray-400">
              <MessageCircle className="w-24 h-24 mb-4" />
              <p className="text-xl font-medium">{localeText(language, 'اختر محادثة للبدء', 'Choose a conversation to start')}</p>
              <p className="text-sm mt-2">{localeText(language, 'حدد محادثة من القائمة لبدء الدردشة', 'Select a conversation from the list to start chatting')}</p>
              <button
                onClick={handleNewChat}
                className="mt-4 bg-[#10B981] text-white px-6 py-2 rounded-lg font-bold hover:bg-[#003d6e] transition-colors"
              >
                + {localeText(language, 'ابدأ محادثة جديدة', 'Start a new chat')}
              </button>
            </Card>
          )}
        </div>
      </div>

      {showNewChatModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden">
            <div className="bg-[#10B981] text-white p-4 flex justify-between items-center">
              <h3 className="font-bold text-lg">{localeText(language, 'اختر جهة الاتصال', 'Choose a contact')}</h3>
              <button
                onClick={() => setShowNewChatModal(false)}
                className="hover:bg-white/20 rounded-full p-1 transition-colors"
              >
                  <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {loadingContacts ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-[#10B981] border-t-transparent rounded-full"></div>
                </div>
              ) : availableContacts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="font-medium">{localeText(language, 'لا توجد جهات اتصال متاحة', 'No contacts available')}</p>
                  <p className="text-sm mt-2">{localeText(language, 'لا يوجد طلاب مسجلين لديك حالياً', 'You have no registered students yet')}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {availableContacts.map((contact) => {
                    const badge = getRoleBadge(contact.role)
                    return (
                      <button
                        key={contact.id}
                        onClick={() => handleSelectContact(contact)}
                         className="w-full p-4 rounded-lg hover:bg-gray-100 transition-colors text-start border border-gray-200 flex items-center gap-3"
                      >
                        <div className="relative flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#e8f1e9] font-bold text-[#286547]">
                          {contact.profilePhoto ? (
                            <Image src={contact.profilePhoto} alt="" fill sizes="48px" unoptimized className="rounded-full object-cover" />
                          ) : (
                            contact.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900">{contact.name}</h4>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${badge.color}`}>
                            {badge.text}
                          </span>
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