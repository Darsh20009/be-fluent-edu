'use client'

import { useState, useEffect } from 'react'
import { Globe, Save, Upload, RefreshCw, Eye, Edit3, Image as ImageIcon, Type, Link2, Trash2, Plus, ChevronDown } from 'lucide-react'
import { toast } from 'react-hot-toast'

/* ─── Types ─────────────────────────────────────────────── */
interface DynamicItem { title: string; title_ar: string; desc: string; icon: string }
const emptyItem = (): DynamicItem => ({ title: '', title_ar: '', desc: '', icon: '' })

interface StaticFieldDef { id: string; label: string; type: string; placeholder?: string }
interface SectionDef { id: string; name: string; fields: StaticFieldDef[] }

/* ─── Static sections config ───────────────────────────── */
const HERO_FIELDS: StaticFieldDef[] = [
  { id: 'title_ar',    label: 'العنوان الرئيسي (عربي)',    type: 'text',     placeholder: 'تعلم الإنجليزية بطريقة ذكية' },
  { id: 'title_en',    label: 'العنوان الرئيسي (إنجليزي)', type: 'text',     placeholder: 'Learn English the Smart Way' },
  { id: 'subtitle_ar', label: 'العنوان الفرعي (عربي)',     type: 'textarea', placeholder: 'وصف مختصر...' },
  { id: 'subtitle_en', label: 'العنوان الفرعي (إنجليزي)',  type: 'textarea', placeholder: 'Short description...' },
  { id: 'cta_text',    label: 'نص زر الدعوة للعمل',        type: 'text',     placeholder: 'ابدأ الآن' },
  { id: 'hero_bg',     label: 'صورة الخلفية',              type: 'image' },
]
const STATS_FIELDS: StaticFieldDef[] = [1, 2, 3, 4].flatMap(n => [
  { id: `stat${n}_num`,   label: `الإحصائية ${n} (الرقم)`,  type: 'text' },
  { id: `stat${n}_label_ar`, label: `الإحصائية ${n} (الوصف - عربي)`, type: 'text' },
  { id: `stat${n}_label_en`, label: `الإحصائية ${n} (الوصف - إنجليزي)`, type: 'text' },
])
const CONTACT_FIELDS: StaticFieldDef[] = [
  { id: 'whatsapp',  label: 'رقم واتساب',        type: 'text', placeholder: '201091515594' },
  { id: 'email',     label: 'البريد الإلكتروني',  type: 'text', placeholder: 'info@befluent-edu.online' },
  { id: 'facebook',  label: 'رابط فيسبوك',        type: 'url' },
  { id: 'instagram', label: 'رابط إنستغرام',      type: 'url' },
]

/* ─── ImageField component (outside parent) ─────────────── */
function ImageField({ value, onChange, onUpload, uploading }: {
  value: string; onChange: (v: string) => void
  onUpload: (f: File) => void; uploading: boolean
}) {
  return (
    <div className="flex items-center gap-3">
      {value ? (
        <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 group flex-shrink-0">
          <img src={value} alt="" className="w-full h-full object-cover" />
          <button onClick={() => onChange('')} className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Trash2 className="w-5 h-5 text-white" />
          </button>
        </div>
      ) : (
        <div className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50 flex-shrink-0">
          <ImageIcon className="w-6 h-6 text-gray-300" />
        </div>
      )}
      <div className="flex-1 space-y-2">
        <input
          type="text" value={value} onChange={e => onChange(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-400 outline-none"
          placeholder="أو أدخل رابط الصورة..."
        />
        <label className={`flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-bold text-gray-600 cursor-pointer transition ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
          <Upload className="w-4 h-4" />
          {uploading ? 'جاري الرفع...' : 'رفع صورة'}
          <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && onUpload(e.target.files[0])} disabled={uploading} />
        </label>
      </div>
    </div>
  )
}

/* ─── StaticFormField (outside parent) ──────────────────── */
function StaticFormField({ sectionId, field, value, onChange, onImageUpload, uploading }: {
  sectionId: string; field: StaticFieldDef
  value: string; onChange: (v: string) => void
  onImageUpload: (file: File, section: string, fieldId: string) => void
  uploading: boolean
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-gray-500 block">{field.label}</label>
      {field.type === 'image' ? (
        <ImageField value={value} onChange={onChange} onUpload={f => onImageUpload(f, sectionId, field.id)} uploading={uploading} />
      ) : field.type === 'textarea' ? (
        <textarea value={value} onChange={e => onChange(e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-400 outline-none resize-none"
          rows={3} placeholder={field.placeholder} />
      ) : (
        <input type={field.type === 'url' ? 'url' : 'text'} value={value} onChange={e => onChange(e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-400 outline-none"
          placeholder={field.placeholder} />
      )}
    </div>
  )
}

/* ─── DynamicItemCard (outside parent) ─────────────────── */
function DynamicItemCard({ item, idx, total, label, hasEnglishTitle, onUpdate, onRemove, onAdd, onImageUpload, uploading }: {
  item: DynamicItem; idx: number; total: number; label: string; hasEnglishTitle?: boolean
  onUpdate: (idx: number, field: keyof DynamicItem, val: string) => void
  onRemove: (idx: number) => void; onAdd: () => void
  onImageUpload: (file: File, idx: number) => void; uploading: boolean
}) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-black text-gray-700 flex items-center gap-2">
          <div className="w-6 h-6 bg-emerald-600 text-white rounded-lg flex items-center justify-center text-xs font-black">{idx + 1}</div>
          {label} {idx + 1}
        </span>
        <div className="flex items-center gap-1">
          {idx === total - 1 && (
            <button onClick={onAdd} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg text-xs font-bold transition">
              <Plus className="w-3 h-3" /> إضافة {label}
            </button>
          )}
          {total > 1 && (
            <button onClick={() => onRemove(idx)} className="p-1.5 hover:bg-red-100 text-red-400 hover:text-red-600 rounded-lg transition">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
      {/* Title(s) */}
      <div className={`grid gap-3 ${hasEnglishTitle ? 'sm:grid-cols-2' : ''}`}>
        <div>
          <label className="text-xs font-bold text-gray-500 block mb-1">العنوان (عربي)</label>
          <input type="text" value={item.title_ar} onChange={e => onUpdate(idx, 'title_ar', e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-400 outline-none bg-white"
            placeholder="العنوان بالعربي..." />
        </div>
        {hasEnglishTitle && (
          <div>
            <label className="text-xs font-bold text-gray-500 block mb-1">العنوان (إنجليزي)</label>
            <input type="text" value={item.title} onChange={e => onUpdate(idx, 'title', e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-400 outline-none bg-white"
              placeholder="Title in English..." />
          </div>
        )}
      </div>
      {/* Description */}
      <div>
        <label className="text-xs font-bold text-gray-500 block mb-1">الوصف</label>
        <textarea value={item.desc} onChange={e => onUpdate(idx, 'desc', e.target.value)}
          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-400 outline-none resize-none bg-white"
          rows={2} placeholder="وصف مختصر..." />
      </div>
      {/* Icon */}
      <div>
        <label className="text-xs font-bold text-gray-500 block mb-1">الأيقونة / الصورة</label>
        <ImageField value={item.icon} onChange={v => onUpdate(idx, 'icon', v)} onUpload={f => onImageUpload(f, idx)} uploading={uploading} />
      </div>
    </div>
  )
}

/* ─── SectionCard (outside parent) ─────────────────────── */
function SectionCard({ id, title, fieldCount, expanded, onToggle, onSave, isSaving, children }: {
  id: string; title: string; fieldCount?: number; expanded: boolean; onToggle: () => void
  onSave: () => void; isSaving: boolean; children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      <button onClick={onToggle} className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
            <Edit3 className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="font-black text-gray-900">{title}</span>
          {fieldCount !== undefined && <span className="text-xs text-gray-400 font-medium">{fieldCount} عنصر</span>}
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>
      {expanded && (
        <div className="px-6 pb-6 border-t border-gray-100">
          <div className="space-y-4 mt-4">{children}</div>
          <div className="flex justify-end pt-4">
            <button onClick={onSave} disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200 transition disabled:opacity-50">
              <Save className="w-4 h-4" />
              {isSaving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════ MAIN ═══════════════════════════ */
export default function PageEditorTab() {
  const PAGE = 'homepage'
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const [content, setContent]   = useState<Record<string, string>>({})
  const [loading, setLoading]   = useState(false)
  const [saving, setSaving]     = useState<string | null>(null)
  const [uploadingField, setUploadingField] = useState<string | null>(null)
  const [features, setFeatures] = useState<DynamicItem[]>([emptyItem(), emptyItem(), emptyItem()])
  const [steps,    setSteps]    = useState<DynamicItem[]>([emptyItem(), emptyItem(), emptyItem()])

  useEffect(() => { fetchContent() }, [])

  /* ── Fetch all content ─────────────────────────────────── */
  async function fetchContent() {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/page-content?page=${PAGE}`)
      if (!res.ok) return
      const data: Array<{ section: string; field: string; value: string }> = await res.json()
      const map: Record<string, string> = {}
      data.forEach(d => { map[`${d.section}__${d.field}`] = d.value })
      setContent(map)

      // Rebuild features array
      const maxFeat = getMaxIndex(data, 'features', 'feat')
      if (maxFeat > 0) {
        setFeatures(Array.from({ length: maxFeat }, (_, i) => ({
          title:    map[`features__feat${i + 1}_title_en`] || '',
          title_ar: map[`features__feat${i + 1}_title_ar`] || '',
          desc:     map[`features__feat${i + 1}_desc_ar`]  || '',
          icon:     map[`features__feat${i + 1}_icon`]     || '',
        })))
      }

      // Rebuild steps array
      const maxStep = getMaxIndex(data, 'learning_path', 'step')
      if (maxStep > 0) {
        setSteps(Array.from({ length: maxStep }, (_, i) => ({
          title:    map[`learning_path__step${i + 1}_title`] || '',
          title_ar: map[`learning_path__step${i + 1}_title_ar`] || '',
          desc:     map[`learning_path__step${i + 1}_desc`]  || '',
          icon:     map[`learning_path__step${i + 1}_icon`]  || '',
        })))
      }
    } catch { toast.error('فشل تحميل المحتوى') }
    finally { setLoading(false) }
  }

  function getMaxIndex(data: Array<{ section: string; field: string }>, section: string, prefix: string) {
    let max = 0
    data.filter(d => d.section === section).forEach(d => {
      const m = d.field.match(new RegExp(`^${prefix}(\\d+)_`))
      if (m) max = Math.max(max, parseInt(m[1]))
    })
    return max
  }

  const getVal = (section: string, field: string) => content[`${section}__${field}`] || ''
  const setVal = (section: string, field: string, value: string) =>
    setContent(c => ({ ...c, [`${section}__${field}`]: value }))

  /* ── Save helpers ──────────────────────────────────────── */
  async function postField(section: string, field: string, value: string) {
    return fetch('/api/admin/page-content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page: PAGE, section, field, value, type: 'text' })
    })
  }

  async function saveStaticSection(sectionId: string, fields: StaticFieldDef[]) {
    setSaving(sectionId)
    try {
      await Promise.all(fields.map(f => postField(sectionId, f.id, getVal(sectionId, f.id))))
      toast.success('تم حفظ التعديلات ✓')
    } catch { toast.error('فشل الحفظ') }
    finally { setSaving(null) }
  }

  async function saveFeatures() {
    setSaving('features')
    try {
      const calls: Promise<any>[] = []
      features.forEach((f, i) => {
        const n = i + 1
        calls.push(postField('features', `feat${n}_title_en`, f.title))
        calls.push(postField('features', `feat${n}_title_ar`, f.title_ar))
        calls.push(postField('features', `feat${n}_desc_ar`,  f.desc))
        calls.push(postField('features', `feat${n}_icon`,     f.icon))
      })
      await Promise.all(calls)
      toast.success('تم حفظ المميزات ✓')
    } catch { toast.error('فشل الحفظ') }
    finally { setSaving(null) }
  }

  async function saveSteps() {
    setSaving('learning_path')
    try {
      const calls: Promise<any>[] = []
      steps.forEach((s, i) => {
        const n = i + 1
        calls.push(postField('learning_path', `step${n}_title`,    s.title_ar || s.title))
        calls.push(postField('learning_path', `step${n}_title_ar`, s.title_ar))
        calls.push(postField('learning_path', `step${n}_desc`,     s.desc))
        calls.push(postField('learning_path', `step${n}_icon`,     s.icon))
      })
      await Promise.all(calls)
      toast.success('تم حفظ مسار التعلم ✓')
    } catch { toast.error('فشل الحفظ') }
    finally { setSaving(null) }
  }

  /* ── Image upload ──────────────────────────────────────── */
  async function uploadImageFile(file: File): Promise<string | null> {
    const fd = new FormData(); fd.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    return res.ok ? (await res.json()).url : null
  }

  async function handleStaticImageUpload(file: File, section: string, fieldId: string) {
    setUploadingField(`${section}__${fieldId}`)
    const url = await uploadImageFile(file)
    if (url) { setVal(section, fieldId, url); toast.success('تم رفع الصورة') }
    else toast.error('فشل رفع الصورة')
    setUploadingField(null)
  }

  async function handleDynamicImageUpload(file: File, which: 'features' | 'steps', idx: number) {
    setUploadingField(`${which}_${idx}`)
    const url = await uploadImageFile(file)
    if (url) {
      if (which === 'features') setFeatures(f => f.map((x, i) => i === idx ? { ...x, icon: url } : x))
      else setSteps(s => s.map((x, i) => i === idx ? { ...x, icon: url } : x))
      toast.success('تم رفع الصورة')
    } else toast.error('فشل رفع الصورة')
    setUploadingField(null)
  }

  const toggle = (id: string) => setExpandedSection(p => p === id ? null : id)

  /* ── RENDER ─────────────────────────────────────────────── */
  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <Globe className="w-6 h-6 text-emerald-600" />
            محرر الصفحات
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">عدّل كل تفصيلة في الموقع بدون مبرمج — التغييرات تظهر فوراً</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchContent} disabled={loading} className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl transition">
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
        <Edit3 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-blue-900">كيف يعمل المحرر؟</p>
          <p className="text-blue-700 mt-0.5">اختر القسم ثم عدّل البيانات، ثم اضغط "حفظ التعديلات". يمكنك إضافة خطوات ومميزات جديدة أو حذف الموجودة. البيانات المحفوظة مسبقاً تظهر تلقائياً.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40 bg-white rounded-2xl border border-gray-200">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">

          {/* SECTION 1 - Hero */}
          <SectionCard id="hero" title="SECTION 1 — Hero" expanded={expandedSection === 'hero'} onToggle={() => toggle('hero')}
            onSave={() => saveStaticSection('hero', HERO_FIELDS)} isSaving={saving === 'hero'}>
            {/* Live preview */}
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-xs font-bold text-gray-400 mb-3 flex items-center gap-2"><Eye className="w-3.5 h-3.5" />معاينة مباشرة</p>
              <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-900 flex items-center justify-center text-center p-6">
                {getVal('hero', 'hero_bg') && <img src={getVal('hero', 'hero_bg')} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" />}
                <div className="relative z-10 space-y-2">
                  <h3 className="text-white font-black text-xl">{getVal('hero', 'title_ar') || 'العنوان الرئيسي'}</h3>
                  <p className="text-gray-300 text-xs max-w-xs mx-auto">{getVal('hero', 'subtitle_ar') || 'وصف...'}</p>
                  <span className="inline-block px-4 py-1.5 bg-emerald-500 text-white text-[10px] font-bold rounded-lg">
                    {getVal('hero', 'cta_text') || 'ابدأ الآن'}
                  </span>
                </div>
              </div>
            </div>
            {HERO_FIELDS.map(f => (
              <StaticFormField key={f.id} sectionId="hero" field={f} value={getVal('hero', f.id)}
                onChange={v => setVal('hero', f.id, v)}
                onImageUpload={handleStaticImageUpload}
                uploading={uploadingField === `hero__${f.id}`} />
            ))}
          </SectionCard>

          {/* SECTION 2 - Stats */}
          <SectionCard id="stats" title="SECTION 2 — الإحصاءات" expanded={expandedSection === 'stats'} onToggle={() => toggle('stats')}
            onSave={() => saveStaticSection('stats', STATS_FIELDS)} isSaving={saving === 'stats'}>
            <div className="grid sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="bg-gray-50 rounded-xl p-4 space-y-2 border border-gray-100">
                  <p className="text-xs font-black text-gray-500">الإحصائية {n}</p>
                  {STATS_FIELDS.filter(f => f.id.startsWith(`stat${n}_`)).map(f => (
                    <StaticFormField key={f.id} sectionId="stats" field={f} value={getVal('stats', f.id)}
                      onChange={v => setVal('stats', f.id, v)}
                      onImageUpload={handleStaticImageUpload}
                      uploading={uploadingField === `stats__${f.id}`} />
                  ))}
                </div>
              ))}
            </div>
          </SectionCard>

          {/* SECTION 3 - Features (Dynamic) */}
          <SectionCard id="features" title="SECTION 3 — المميزات" fieldCount={features.length}
            expanded={expandedSection === 'features'} onToggle={() => toggle('features')}
            onSave={saveFeatures} isSaving={saving === 'features'}>
            {features.map((feat, idx) => (
              <DynamicItemCard key={idx} item={feat} idx={idx} total={features.length} label="ميزة" hasEnglishTitle
                onUpdate={(i, field, val) => setFeatures(f => f.map((x, j) => j === i ? { ...x, [field]: val } : x))}
                onRemove={i => setFeatures(f => f.filter((_, j) => j !== i))}
                onAdd={() => setFeatures(f => [...f, emptyItem()])}
                onImageUpload={(file, i) => handleDynamicImageUpload(file, 'features', i)}
                uploading={uploadingField === `features_${idx}`} />
            ))}
            {features.length === 0 && (
              <button onClick={() => setFeatures([emptyItem()])}
                className="w-full py-4 border-2 border-dashed border-emerald-300 rounded-2xl text-emerald-600 font-bold text-sm flex items-center justify-center gap-2 hover:bg-emerald-50 transition">
                <Plus className="w-4 h-4" /> إضافة ميزة
              </button>
            )}
          </SectionCard>

          {/* SECTION 4 - Contact */}
          <SectionCard id="contact" title="SECTION 4 — معلومات التواصل" expanded={expandedSection === 'contact'} onToggle={() => toggle('contact')}
            onSave={() => saveStaticSection('contact', CONTACT_FIELDS)} isSaving={saving === 'contact'}>
            {CONTACT_FIELDS.map(f => (
              <StaticFormField key={f.id} sectionId="contact" field={f} value={getVal('contact', f.id)}
                onChange={v => setVal('contact', f.id, v)}
                onImageUpload={handleStaticImageUpload}
                uploading={uploadingField === `contact__${f.id}`} />
            ))}
          </SectionCard>

          {/* SECTION 5 - Learning Path (Dynamic) */}
          <SectionCard id="learning_path" title="SECTION 5 — مسار التعلم" fieldCount={steps.length}
            expanded={expandedSection === 'learning_path'} onToggle={() => toggle('learning_path')}
            onSave={saveSteps} isSaving={saving === 'learning_path'}>
            {steps.map((step, idx) => (
              <DynamicItemCard key={idx} item={step} idx={idx} total={steps.length} label="خطوة" hasEnglishTitle
                onUpdate={(i, field, val) => setSteps(s => s.map((x, j) => j === i ? { ...x, [field]: val } : x))}
                onRemove={i => setSteps(s => s.filter((_, j) => j !== i))}
                onAdd={() => setSteps(s => [...s, emptyItem()])}
                onImageUpload={(file, i) => handleDynamicImageUpload(file, 'steps', i)}
                uploading={uploadingField === `steps_${idx}`} />
            ))}
            {steps.length === 0 && (
              <button onClick={() => setSteps([emptyItem()])}
                className="w-full py-4 border-2 border-dashed border-emerald-300 rounded-2xl text-emerald-600 font-bold text-sm flex items-center justify-center gap-2 hover:bg-emerald-50 transition">
                <Plus className="w-4 h-4" /> إضافة خطوة
              </button>
            )}
          </SectionCard>
        </div>
      )}
    </div>
  )
}
