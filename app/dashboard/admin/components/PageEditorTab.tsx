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
        name: 'SECTION 1 - Hero',
        fields: [
          { id: 'title_ar', label: 'العنوان الرئيسي (عربي)', type: 'text', placeholder: 'تعلم الإنجليزية بطريقة ذكية' },
          { id: 'title_en', label: 'العنوان الرئيسي (إنجليزي)', type: 'text', placeholder: 'Learn English the Smart Way' },
          { id: 'subtitle_ar', label: 'العنوان الفرعي (عربي)', type: 'textarea', placeholder: 'وصف مختصر للأكاديمية...' },
          { id: 'subtitle_en', label: 'العنوان الفرعي (إنجليزي)', type: 'textarea', placeholder: 'Short description...' },
          { id: 'cta_text', label: 'نص زر الدعوة للعمل', type: 'text', placeholder: 'ابدأ الآن' },
          { id: 'hero_bg', label: 'صورة الخلفية', type: 'image' },
        ]
      },
      {
        id: 'stats',
        name: 'SECTION 2 - Stats',
        fields: [
          { id: 'stat1_num', label: 'الإحصائية 1 (الرقم)', type: 'text', placeholder: '+500' },
          { id: 'stat1_label', label: 'الإحصائية 1 (الوصف)', type: 'text', placeholder: 'طالب سعيد' },
          { id: 'stat2_num', label: 'الإحصائية 2 (الرقم)', type: 'text', placeholder: '+50' },
          { id: 'stat2_label', label: 'الإحصائية 2 (الوصف)', type: 'text', placeholder: 'معلم خبير' },
          { id: 'stat3_num', label: 'الإحصائية 3 (الرقم)', type: 'text', placeholder: '98%' },
          { id: 'stat3_label', label: 'الإحصائية 3 (الوصف)', type: 'text', placeholder: 'نسبة الرضا' },
          { id: 'stat4_num', label: 'الإحصائية 4 (الرقم)', type: 'text', placeholder: '+20' },
          { id: 'stat4_label', label: 'الإحصائية 4 (الوصف)', type: 'text', placeholder: 'دورة تدريبية' },
        ]
      },
      {
        id: 'features',
        name: 'SECTION 3 - Features',
        fields: [
          { id: 'feat1_title_ar', label: 'الميزة 1 (العنوان - عربي)', type: 'text' },
          { id: 'feat1_title_en', label: 'الميزة 1 (العنوان - إنجليزي)', type: 'text' },
          { id: 'feat1_desc_ar', label: 'الميزة 1 (الوصف - عربي)', type: 'textarea' },
          { id: 'feat1_desc_en', label: 'الميزة 1 (الوصف - إنجليزي)', type: 'textarea' },
          { id: 'feat1_icon', label: 'الميزة 1 (أيقونة)', type: 'image' },
          
          { id: 'feat2_title_ar', label: 'الميزة 2 (العنوان - عربي)', type: 'text' },
          { id: 'feat2_title_en', label: 'الميزة 2 (العنوان - إنجليزي)', type: 'text' },
          { id: 'feat2_desc_ar', label: 'الميزة 2 (الوصف - عربي)', type: 'textarea' },
          { id: 'feat2_desc_en', label: 'الميزة 2 (الوصف - إنجليزي)', type: 'textarea' },
          { id: 'feat2_icon', label: 'الميزة 2 (أيقونة)', type: 'image' },

          { id: 'feat3_title_ar', label: 'الميزة 3 (العنوان - عربي)', type: 'text' },
          { id: 'feat3_title_en', label: 'الميزة 3 (العنوان - إنجليزي)', type: 'text' },
          { id: 'feat3_desc_ar', label: 'الميزة 3 (الوصف - عربي)', type: 'textarea' },
          { id: 'feat3_desc_en', label: 'الميزة 3 (الوصف - إنجليزي)', type: 'textarea' },
          { id: 'feat3_icon', label: 'الميزة 3 (أيقونة)', type: 'image' },
        ]
      },
      {
        id: 'contact',
        name: 'SECTION 4 - Contact',
        fields: [
          { id: 'whatsapp', label: 'رقم واتساب', type: 'text', placeholder: '201091515594' },
          { id: 'email', label: 'البريد الإلكتروني', type: 'text', placeholder: 'info@befluent-edu.online' },
          { id: 'facebook', label: 'رابط فيسبوك', type: 'url' },
          { id: 'instagram', label: 'رابط إنستغرام', type: 'url' },
        ]
      },
      {
        id: 'learning_path',
        name: 'SECTION 5 - Learning Path',
        fields: [
          { id: 'step1_title', label: 'الخطوة 1 (العنوان)', type: 'text' },
          { id: 'step1_desc', label: 'الخطوة 1 (الوصف)', type: 'textarea' },
          { id: 'step1_icon', label: 'الخطوة 1 (أيقونة)', type: 'image' },
          
          { id: 'step2_title', label: 'الخطوة 2 (العنوان)', type: 'text' },
          { id: 'step2_desc', label: 'الخطوة 2 (الوصف)', type: 'textarea' },
          { id: 'step2_icon', label: 'الخطوة 2 (أيقونة)', type: 'image' },

          { id: 'step3_title', label: 'الخطوة 3 (العنوان)', type: 'text' },
          { id: 'step3_desc', label: 'الخطوة 3 (الوصف)', type: 'textarea' },
          { id: 'step3_icon', label: 'الخطوة 3 (أيقونة)', type: 'image' },
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
                      {/* Live Preview for Hero */}
                      {section.id === 'hero' && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                          <p className="text-xs font-bold text-gray-400 mb-3 flex items-center gap-2">
                            <Eye className="w-3.5 h-3.5" />
                            معاينة مباشرة للقسم
                          </p>
                          <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-900 flex flex-col items-center justify-center text-center p-6 space-y-3">
                            {getVal('hero', 'hero_bg') && (
                              <img src={getVal('hero', 'hero_bg')} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" />
                            )}
                            <div className="relative z-10 space-y-2">
                              <h3 className="text-white font-black text-xl leading-tight">
                                {getVal('hero', 'title_ar') || 'العنوان الرئيسي'}
                                <br />
                                <span className="text-emerald-400">{getVal('hero', 'title_en') || 'Main Title'}</span>
                              </h3>
                              <p className="text-gray-300 text-xs line-clamp-2 max-w-xs mx-auto">
                                {getVal('hero', 'subtitle_ar') || 'وصف فرعي يظهر هنا...'}
                              </p>
                              <div className="pt-2">
                                <span className="px-4 py-1.5 bg-emerald-500 text-white text-[10px] font-bold rounded-lg shadow-lg">
                                  {getVal('hero', 'cta_text') || 'ابدأ الآن'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="space-y-4 mt-4">
                        {section.fields.map(field => {
                          const Icon = TYPE_ICONS[field.type] || Type
                          const val = getVal(section.id, field.id)
                          const isUploading = uploadingField === `${section.id}__${field.id}`

                          return (
                            <div key={field.id} className="space-y-1.5">
                              <label className="flex items-center gap-2 text-xs font-bold text-gray-500">
                                <Icon className="w-3.5 h-3.5" />
                                {field.label}
                              </label>

                              {field.type === 'image' ? (
                                <div className="space-y-3">
                                  <div className="flex items-center gap-3">
                                    {val ? (
                                      <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 group">
                                        <img src={val} alt="" className="w-full h-full object-cover" />
                                        <button 
                                          onClick={() => setVal(section.id, field.id, '')}
                                          className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                          <Trash2 className="w-5 h-5 text-white" />
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50">
                                        <Image className="w-6 h-6 text-gray-300" />
                                      </div>
                                    )}
                                    <div className="flex-1">
                                      <input
                                        type="text"
                                        value={val}
                                        onChange={e => setVal(section.id, field.id, e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-400 outline-none mb-2"
                                        placeholder="أو أدخل رابط الصورة..."
                                      />
                                      <label className={`flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-bold text-gray-600 cursor-pointer transition ${isUploading ? 'opacity-50' : ''}`}>
                                        <Upload className="w-4 h-4" />
                                        {isUploading ? 'جاري الرفع...' : 'رفع صورة'}
                                        <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0], section.id, field.id)} disabled={isUploading} />
                                      </label>
                                    </div>
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
