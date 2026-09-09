'use client'

import { useState, useEffect } from 'react'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  Home, Users, Calendar, BookOpen, MessageCircle, LogOut, Shield, FileText, Menu, X
} from 'lucide-react'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import FloatingContactButtons from '@/components/FloatingContactButtons'
import ChatBox from '@/components/ChatBox'
import ConversationsList from '@/components/ConversationsList'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
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

export default function TeacherDashboardClient({ user: initialUser }: TeacherDashboardClientProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('home')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState(initialUser)
  const [loading, setLoading] = useState(!initialUser.teacherProfileId)

  useEffect(() => {
    if (!user.teacherProfileId) {
      setupTeacherProfile()
    }
  }, [user.teacherProfileId])

  async function setupTeacherProfile() {
    try {
      const response = await fetch('/api/teacher/setup', {
        method: 'POST'
      })
      if (response.ok) {
        const data = await response.json()
        setUser({ ...user, teacherProfileId: data.teacherProfileId })
      }
    } catch (error) {
      console.error('Error setting up teacher profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push('/auth/login')
  }

  const menuItems = [
    { id: 'home', label: 'Home / الرئيسية', icon: Home },
    { id: 'students', label: 'Students / الطلاب', icon: Users },
    { id: 'sessions', label: 'Sessions / الحصص', icon: Calendar },
    { id: 'assignments', label: 'Assignments / الواجبات', icon: BookOpen },
    { id: 'writing-tests', label: 'Writing Tests / اختبارات الكتابة', icon: FileText },
    { id: 'manuscripts', label: 'Manuscripts / المخطوطات', icon: BookOpen },
    { id: 'chat', label: 'Chat / الدردشة', icon: MessageCircle },
  ]

  return (
    <div className="min-h-screen bg-[#f4f1e9] text-[#1f2924] [&_button]:rounded-none [&_input]:rounded-none [&_select]:rounded-none [&_textarea]:rounded-none" dir="rtl">
      <header className="sticky top-0 z-30 border-b border-[#d7d4ca] bg-[#f8f6f0]/95 backdrop-blur">
        <div className="mx-auto max-w-[1600px] px-4 py-3 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                aria-label="فتح القائمة"
                className="lg:hidden grid h-9 w-9 place-items-center border border-[#c9c7bc] bg-[#f8f6f0] text-[#174d3a] transition-colors hover:bg-[#e8eee8]"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="border-r-2 border-[#174d3a] pr-3 leading-none">
                <h1 className="text-lg font-black tracking-[-0.06em] text-[#174d3a] sm:text-xl">Be Fluent</h1>
                <span className="mt-1 block text-[9px] font-bold tracking-[0.16em] text-[#758178]">TEACHER DESK</span>
              </div>
              <Link href="/dashboard/admin" className="hidden items-center gap-2 border border-[#b8c8ba] bg-[#e8eee8] px-3 py-2 text-xs font-bold text-[#174d3a] transition-colors hover:bg-[#d8e5d9] sm:flex">
                <Shield className="h-4 w-4" />
                <span className="text-xs font-bold">لوحة الأدمن</span>
              </Link>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="hidden text-left sm:block">
                <span className="block text-xs font-bold text-[#1f2924]">{user.name}</span>
                <span className="text-[10px] font-medium text-[#758178]">المساحة التعليمية</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="!rounded-none !border-[#9c4437] !bg-transparent !px-2 !text-xs !text-[#9c4437] hover:!bg-[#f6e8e2] sm:!px-4"
              >
                <LogOut className="h-4 w-4 sm:ml-2" />
                <span className="hidden sm:inline">Logout / خروج</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1600px] px-4 py-4 sm:px-6 sm:py-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
          {/* Mobile Sidebar Overlay */}
          {sidebarOpen && (
            <div 
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Sidebar */}
          <div className={`
             fixed lg:static inset-y-0 right-0 z-50 lg:z-auto
             w-72 lg:w-64 lg:flex-none
            transform lg:transform-none transition-transform duration-300
             ${sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
          `}>
            <Card variant="elevated" padding="none" className="h-full !rounded-none !border-[#d7d4ca] !bg-[#f8f6f0] !shadow-none lg:h-auto">
              <div className="border-b border-[#d7d4ca] p-4">
                <div className="flex items-center justify-between lg:justify-start gap-3">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex h-10 w-10 items-center justify-center bg-[#174d3a] text-lg font-bold text-[#f8f6f0] sm:h-12 sm:w-12 sm:text-xl">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#1f2924] sm:text-base">{user.name}</p>
                      <p className="text-xs text-[#758178] sm:text-sm">Teacher / مدرس</p>
                    </div>
                  </div>
                  <button 
                    className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            <nav className="p-2" aria-label="Teacher navigation">
                {menuItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id)
                        setSidebarOpen(false)
                      }}
                       className={`mb-1 flex w-full items-center gap-3 border-r-2 px-3 py-2.5 text-right transition-colors sm:px-4 ${
                        activeTab === item.id
                           ? 'border-[#174d3a] bg-[#dce9dc] font-bold text-[#174d3a]'
                           : 'border-transparent text-[#4c5750] hover:bg-[#eeece5] hover:text-[#174d3a]'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-xs sm:text-sm font-medium">{item.label}</span>
                    </button>
                  )
                })}
              </nav>
            </Card>
          </div>

          <div className="min-w-0 flex-1">
            {activeTab === 'home' && user.teacherProfileId && <HomeTab teacherProfileId={user.teacherProfileId} />}
            {activeTab === 'students' && user.teacherProfileId && <StudentsTab teacherProfileId={user.teacherProfileId} />}
            {activeTab === 'sessions' && user.teacherProfileId && <SessionsTab teacherProfileId={user.teacherProfileId} />}
            {activeTab === 'assignments' && user.teacherProfileId && <AssignmentsTab teacherProfileId={user.teacherProfileId} />}
            {activeTab === 'writing-tests' && user.teacherProfileId && <WritingTestsTab teacherProfileId={user.teacherProfileId} />}
            {activeTab === 'manuscripts' && user.teacherProfileId && <ManuscriptsTab teacherProfileId={user.teacherProfileId} />}
            {activeTab === 'chat' && <ChatTab />}
          </div>
        </div>
      </div>
      <FloatingContactButtons />
    </div>
  )
}

function ChatTab() {
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [showNewChatModal, setShowNewChatModal] = useState(false)
  const [availableContacts, setAvailableContacts] = useState<any[]>([])
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

  const handleSelectContact = (contact: any) => {
    setSelectedUser(contact)
    setShowNewChatModal(false)
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'STUDENT': return { text: 'طالب', color: 'bg-blue-100 text-blue-700' }
      case 'ADMIN': return { text: 'مدير', color: 'bg-red-100 text-red-700' }
      default: return { text: 'مستخدم', color: 'bg-gray-100 text-gray-700' }
    }
  }

  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-bold text-[#10B981] mb-4 sm:mb-6">
        Chat / الدردشة
      </h2>
      <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-250px)] sm:h-[calc(100vh-300px)]">
        <div className="lg:flex-none lg:w-1/3">
          <Card variant="elevated" padding="none" className="h-full overflow-hidden">
            <div className="bg-gradient-to-r from-[#10B981] to-[#059669] p-4 text-white flex justify-between items-center">
              <h3 className="font-bold text-lg">المحادثات</h3>
              <button
                onClick={handleNewChat}
                className="bg-white text-[#10B981] px-3 py-1 rounded-lg text-sm font-bold hover:bg-gray-100 transition-colors"
              >
                + محادثة جديدة
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
              <p className="text-xl font-medium">اختر محادثة للبدء</p>
              <p className="text-sm mt-2">حدد محادثة من القائمة لبدء الدردشة</p>
              <button
                onClick={handleNewChat}
                className="mt-4 bg-[#10B981] text-white px-6 py-2 rounded-lg font-bold hover:bg-[#003d6e] transition-colors"
              >
                + ابدأ محادثة جديدة
              </button>
            </Card>
          )}
        </div>
      </div>

      {showNewChatModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden">
            <div className="bg-[#10B981] text-white p-4 flex justify-between items-center">
              <h3 className="font-bold text-lg">اختر جهة الاتصال</h3>
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
                  <p className="font-medium">لا توجد جهات اتصال متاحة</p>
                  <p className="text-sm mt-2">لا يوجد طلاب مسجلين لديك حالياً</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {availableContacts.map((contact) => {
                    const badge = getRoleBadge(contact.role)
                    return (
                      <button
                        key={contact.id}
                        onClick={() => handleSelectContact(contact)}
                        className="w-full p-4 rounded-lg hover:bg-gray-100 transition-colors text-right border border-gray-200 flex items-center gap-3"
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-[#10B981] to-[#059669] rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                          {contact.profilePhoto ? (
                            <img src={contact.profilePhoto} alt={contact.name} className="w-full h-full rounded-full object-cover" />
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