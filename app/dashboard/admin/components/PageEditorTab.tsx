'use client'

import { useState, useEffect, useRef } from 'react'
import { Globe, Save, Upload, RefreshCw, Eye, Edit3, Image, Type, Link2, Palette, CheckCircle, Plus, Trash2, X } from 'lucide-react'
import { toast } from 'react-hot-toast'

const PAGES = [
  {
    id: 'homepage',
    name: 'الصفحة الرئيسية',
    sections: [
      {
        id: 'hero',
        name: 'القسم الرئيسي (Hero)',
        fields: [
          { id: 'title_ar', label: 'العنوان الرئيسي (عربي)', type: 'text', placeholder: 'تعلم الإنجليزية بطريقة ذكية' },
          { id: 'title_en', label: 'العنوان الرئيسي (إنجليزي)', type: 'text', placeholder: 'Learn English the Smart Way' },
          { id: 'subtitle_ar', label: 'العنوان الفرعي (عربي)', type: 'textarea', placeholder: 'وصف مختصر للأكاديمية...' },
          { id: 'subtitle_en', label: 'العنوان الفرعي (إنجليزي)', type: 'textarea', placeholder: 'Short description...' },
          { id: 'cta_button', label: 'نص زر الدعوة للعمل', type: 'text', placeholder: 'ابدأ الآن' },
          { id: 'whatsapp_number', label: 'رقم واتساب', type: 'text', placeholder: '201091515594' },
        ]
      },
      {
        id: 'stats',
        name: 'الإحصاءات',
        fields: [
          { id: 'students_count', label: 'عدد الطلاب', type: 'text', placeholder: '+500' },
          { id: 'teachers_count', label: 'عدد المعلمين', type: 'text', placeholder: '+50' },
          { id: 'satisfaction', label: 'نسبة الرضا', type: 'text', placeholder: '98%' },
          { id: 'courses_count', label: 'عدد الدورات', type: 'text', placeholder: '+20' },
        ]
      },
      {
        id: 'about',
        name: 'قسم من نحن',
        fields: [
          { id: 'about_title', label: 'عنوان القسم', type: 'text', placeholder: 'لماذا تختار Be Fluent؟' },
          { id: 'about_text', label: 'النص التعريفي', type: 'textarea', placeholder: 'نص وصفي...' },
          { id: 'feature1', label: 'الميزة 1', type: 'text', placeholder: 'تعلم بالطريقة الأمثل' },
          { id: 'feature2', label: 'الميزة 2', type: 'text', placeholder: 'معلمون خبراء' },
          { id: 'feature3', label: 'الميزة 3', type: 'text', placeholder: 'نتائج مضمونة' },
          { id: 'feature4', label: 'الميزة 4', type: 'text', placeholder: 'دعم مستمر' },
        ]
      },
      {
        id: 'contact',
        name: 'معلومات الاتصال',
        fields: [
          { id: 'email', label: 'البريد الإلكتروني', type: 'text', placeholder: 'info@befluent-edu.online' },
          { id: 'phone', label: 'رقم الهاتف', type: 'text', placeholder: '+20 109 151 5594' },
          { id: 'facebook_url', label: 'رابط فيسبوك', type: 'url', placeholder: 'https://facebook.com/...' },
          { id: 'instagram_url', label: 'رابط إنستغرام', type: 'url', placeholder: 'https://instagram.com/...' },
          { id: 'tiktok_url', label: 'رابط تيك توك', type: 'url', placeholder: 'https://tiktok.com/...' },
        ]
      }
    ]
  },
  {
    id: 'courses',
    name: 'صفحة الدورات',
    sections: [
      {
        id: 'header',
        name: 'رأس الصفحة',
        fields: [
          { id: 'title', label: 'العنوان', type: 'text', placeholder: 'دوراتنا التعليمية' },
          { id: 'subtitle', label: 'الوصف', type: 'textarea', placeholder: 'اختر المستوى المناسب لك' },
        ]
      }
    ]
  },
  {
    id: 'about_page',
    name: 'صفحة من نحن',
    sections: [
      {
        id: 'intro',
        name: 'مقدمة',
        fields: [
          { id: 'title', label: 'العنوان', type: 'text', placeholder: 'قصتنا' },
          { id: 'text', label: 'النص', type: 'textarea', placeholder: 'أسسنا Be Fluent من...' },
          { id: 'vision', label: 'رؤيتنا', type: 'textarea', placeholder: 'نحلم بعالم...' },
          { id: 'mission', label: 'رسالتنا', type: 'textarea', placeholder: 'مهمتنا هي...' },
        ]
      }
    ]
  }
]

const TYPE_ICONS: Record<string, any> = {
  text: Type, textarea: Edit3, url: Link2, image: Image, color: Palette
}

export default function PageEditorTab() {
  const [selectedPage, setSelectedPage] = useState(PAGES[0].id)
  const [selectedSection, setSelectedSection] = useState<string | null>(null)
  const [content, setContent] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploadingField, setUploadingField] = useState<string | null>(null)

  const page = PAGES.find(p => p.id === selectedPage)

  useEffect(() => {
    if (selectedPage) fetchContent()
  }, [selectedPage])

  async function fetchContent() {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/page-content?page=${selectedPage}`)
      if (res.ok) {
        const data = await res.json()
        const map: Record<string, string> = {}
        data.forEach((item: any) => {
          map[`${item.section}__${item.field}`] = item.value
        })
        setContent(map)
      }
    } catch {
      toast.error('فشل تحميل المحتوى')
    } finally {
      setLoading(false)
    }
  }

  function getVal(section: string, field: string) {
    return content[`${section}__${field}`] || ''
  }

  function setVal(section: string, field: string, value: string) {
    setContent(c => ({ ...c, [`${section}__${field}`]: value }))
    setSaved(false)
  }

  async function handleSaveSection(sectionId: string) {
    setSaving(true)
    const section = page?.sections.find(s => s.id === sectionId)
    if (!section) return

    try {
      const promises = section.fields.map(f =>
        fetch('/api/admin/page-content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            page: selectedPage,
            section: sectionId,
            field: f.id,
            value: getVal(sectionId, f.id),
            type: f.type
          })
        })
      )
      await Promise.all(promises)
      setSaved(true)
      toast.success('تم حفظ التعديلات بنجاح ✓')
      setTimeout(() => setSaved(false), 3000)
    } catch {
      toast.error('فشل الحفظ')
    } finally {
      setSaving(false)
    }
  }

  async function handleImageUpload(file: File, section: string, fieldId: string) {
    setUploadingField(`${section}__${fieldId}`)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      if (res.ok) {
        const { url } = await res.json()
        setVal(section, fieldId, url)
        toast.success('تم رفع الصورة')
      } else {
        toast.error('فشل رفع الصورة')
      }
    } catch {
      toast.error('خطأ في رفع الصورة')
    } finally {
      setUploadingField(null)
    }
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <Globe className="w-6 h-6 text-emerald-600" />
            محرر الصفحات
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">عدّل كل تفصيلة في الموقع بدون مبرمج - التغييرات تظهر فوراً</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchContent} disabled={loading} className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl transition" title="تحديث">
            <RefreshCw className={`w-4 h-4 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <a href="/" target="_blank" className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-sm font-bold transition border border-blue-200">
            <Eye className="w-4 h-4" />
            معاينة الموقع
          </a>
        </div>
      </div>

      {/* Info Banner */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-2xl text-sm">
        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <Edit3 className="w-4 h-4 text-blue-600" />
        </div>
        <div>
          <p className="font-bold text-blue-900">كيف يعمل محرر الصفحات؟</p>
          <p className="text-blue-700 mt-0.5">اختر الصفحة ثم القسم الذي تريد تعديله، عدّل النصوص والصور، ثم اضغط "حفظ التعديلات". التغييرات تظهر على الموقع فوراً.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Pages List */}
        <div className="space-y-2">
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest px-1 mb-3">الصفحات</p>
          {PAGES.map(p => (
            <button
              key={p.id}
              onClick={() => { setSelectedPage(p.id); setSelectedSection(null) }}
              className={`w-full text-right px-4 py-3 rounded-xl text-sm font-bold transition ${
                selectedPage === p.id
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <Globe className={`w-4 h-4 inline ml-2 ${selectedPage === p.id ? 'text-white' : 'text-gray-400'}`} />
              {p.name}
            </button>
          ))}
        </div>

        {/* Editor */}
        <div className="lg:col-span-3 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-40 bg-white rounded-2xl border border-gray-200">
              <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            page?.sections.map(section => {
              const isExpanded = selectedSection === section.id
              return (
                <div key={section.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                  <button
                    onClick={() => setSelectedSection(isExpanded ? null : section.id)}
                    className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <Edit3 className="w-4 h-4 text-emerald-600" />
                      </div>
                      <span className="font-black text-gray-900">{section.name}</span>
                      <span className="text-xs text-gray-400 font-medium">{section.fields.length} حقل</span>
                    </div>
                    <div className={`w-6 h-6 flex items-center justify-center transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-6 pb-6 border-t border-gray-100">
                      <div className="space-y-4 mt-4">
                        {section.fields.map(field => {
                          const Icon = TYPE_ICONS[field.type] || Type
                          const val = getVal(section.id, field.id)
                          const isUploading = uploadingField === `${section.id}__${field.id}`

                          return (
                            <div key={field.id}>
                              <label className="flex items-center gap-2 text-xs font-bold text-gray-500 mb-1.5">
                                <Icon className="w-3.5 h-3.5" />
                                {field.label}
                              </label>

                              {field.type === 'image' ? (
                                <div className="flex items-center gap-3">
                                  {val && <img src={val} alt="" className="w-16 h-16 object-cover rounded-xl border border-gray-200" />}
                                  <div className="flex-1">
                                    <input
                                      type="text"
                                      value={val}
                                      onChange={e => setVal(section.id, field.id, e.target.value)}
                                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-400 outline-none mb-2"
                                      placeholder="أو أدخل رابط الصورة..."
                                    />
                                    <label className={`flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-bold text-gray-600 cursor-pointer transition ${isUploading ? 'opacity-50' : ''}`}>
                                      <Upload className="w-3.5 h-3.5" />
                                      {isUploading ? 'جاري الرفع...' : 'رفع صورة'}
                                      <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0], section.id, field.id)} disabled={isUploading} />
                                    </label>
                                  </div>
                                </div>
                              ) : field.type === 'textarea' ? (
                                <textarea
                                  value={val}
                                  onChange={e => setVal(section.id, field.id, e.target.value)}
                                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-400 outline-none resize-none"
                                  rows={3}
                                  placeholder={field.placeholder}
                                />
                              ) : (
                                <input
                                  type={field.type === 'url' ? 'url' : 'text'}
                                  value={val}
                                  onChange={e => setVal(section.id, field.id, e.target.value)}
                                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-400 outline-none"
                                  placeholder={field.placeholder}
                                />
                              )}
                            </div>
                          )
                        })}

                        <div className="flex justify-end pt-2">
                          <button
                            onClick={() => handleSaveSection(section.id)}
                            disabled={saving}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition shadow-lg ${
                              saved
                                ? 'bg-green-500 text-white shadow-green-200'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200'
                            } disabled:opacity-50`}
                          >
                            {saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                            {saving ? 'جاري الحفظ...' : saved ? 'تم الحفظ ✓' : 'حفظ التعديلات'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
