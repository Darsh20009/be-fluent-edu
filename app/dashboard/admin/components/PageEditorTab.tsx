'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Globe, Save, Upload, RefreshCw, Eye, Edit3, Image as ImageIcon, Trash2,
  Plus, ChevronDown, ChevronUp, Star, Zap, Tag, Phone, Video, Users,
  BookOpen, Award, MessageCircle, Target, ArrowRight, Package, Megaphone,
  LayoutTemplate, Palette, CheckCircle, GripVertical
} from 'lucide-react'
import { toast } from 'react-hot-toast'

/* ─── Types ─────────────────────────────────────────────── */
interface DynamicItem { title: string; title_ar: string; desc: string; icon: string }
const emptyItem = (): DynamicItem => ({ title: '', title_ar: '', desc: '', icon: '' })

interface PackageItem { name: string; price: string; lessons: string; duration: string; popular: boolean; badge: string }
const emptyPackage = (): PackageItem => ({ name: '', price: '', lessons: '', duration: '', popular: false, badge: '' })

interface ShowcaseStep { title: string; desc: string }
const emptyStep = (): ShowcaseStep => ({ title: '', desc: '' })

interface HeroImage { src: string; alt: string }

interface StaticFieldDef { id: string; label: string; type: string; placeholder?: string }

/* ─── Image Upload Helper ──────────────────────────────── */
async function uploadImageFile(file: File): Promise<string | null> {
  const fd = new FormData(); fd.append('file', file)
  const res = await fetch('/api/upload', { method: 'POST', body: fd })
  return res.ok ? (await res.json()).url : null
}

/* ─── ImageField ────────────────────────────────────────── */
function ImageField({ value, onChange, onUpload, uploading, compact }: {
  value: string; onChange: (v: string) => void
  onUpload: (f: File) => void; uploading: boolean; compact?: boolean
}) {
  return (
    <div className={`flex items-center gap-3 ${compact ? 'gap-2' : ''}`}>
      {value ? (
        <div className={`relative ${compact ? 'w-14 h-14' : 'w-20 h-20'} rounded-xl overflow-hidden border border-gray-200 group flex-shrink-0`}>
          <img src={value} alt="" className="w-full h-full object-cover" />
          <button onClick={() => onChange('')} className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Trash2 className="w-4 h-4 text-white" />
          </button>
        </div>
      ) : (
        <div className={`${compact ? 'w-14 h-14' : 'w-20 h-20'} rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50 flex-shrink-0`}>
          <ImageIcon className={`${compact ? 'w-5 h-5' : 'w-6 h-6'} text-gray-300`} />
        </div>
      )}
      <div className="flex-1 space-y-2">
        <input
          type="text" value={value} onChange={e => onChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-400 outline-none"
          placeholder="رابط الصورة..." />
        <label className={`flex items-center justify-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-bold text-gray-600 cursor-pointer transition ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
          <Upload className="w-3.5 h-3.5" />
          {uploading ? 'جاري الرفع...' : 'رفع صورة'}
          <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && onUpload(e.target.files[0])} disabled={uploading} />
        </label>
      </div>
    </div>
  )
}

/* ─── SectionCard ───────────────────────────────────────── */
function SectionCard({ id, title, icon: Icon, badge, fieldCount, expanded, onToggle, onSave, isSaving, children, color = 'emerald' }: {
  id: string; title: string; icon?: any; badge?: string; fieldCount?: number
  expanded: boolean; onToggle: () => void; onSave: () => void; isSaving: boolean
  children: React.ReactNode; color?: string
}) {
  const colors: Record<string, string> = {
    emerald: 'bg-emerald-100 text-emerald-600',
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
    rose: 'bg-rose-100 text-rose-600',
    teal: 'bg-teal-100 text-teal-600',
    amber: 'bg-amber-100 text-amber-600',
    indigo: 'bg-indigo-100 text-indigo-600',
  }
  const IconComp = Icon || Edit3
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <button onClick={onToggle} className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50/80 transition">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${colors[color] || colors.emerald}`}>
            <IconComp className="w-4.5 h-4.5" />
          </div>
          <div className="text-right">
            <span className="font-black text-gray-900 block leading-tight">{title}</span>
            {badge && <span className="text-xs text-gray-400 font-medium">{badge}</span>}
          </div>
          {fieldCount !== undefined && (
            <span className="ml-2 px-2.5 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs font-bold">{fieldCount} عنصر</span>
          )}
        </div>
        {expanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
      </button>
      {expanded && (
        <div className="px-6 pb-6 border-t border-gray-100">
          <div className="space-y-4 mt-5">{children}</div>
          <div className="flex justify-end pt-5 border-t border-gray-100 mt-5">
            <button onClick={onSave} disabled={isSaving}
              className="flex items-center gap-2 px-7 py-2.5 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200 transition disabled:opacity-60">
              <Save className="w-4 h-4" />
              {isSaving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── TextField ─────────────────────────────────────────── */
function TF({ label, value, onChange, type = 'text', placeholder, half }: {
  label: string; value: string; onChange: (v: string) => void
  type?: string; placeholder?: string; half?: boolean
}) {
  return (
    <div className={half ? '' : 'col-span-full'}>
      <label className="text-xs font-bold text-gray-500 block mb-1.5">{label}</label>
      {type === 'textarea' ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} rows={3}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-400 outline-none resize-none"
          placeholder={placeholder} />
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-400 outline-none"
          placeholder={placeholder} />
      )}
    </div>
  )
}

/* ═══════════════════════ MAIN ═══════════════════════════ */
export default function PageEditorTab() {
  const PAGE = 'homepage'
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const [content, setContent] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState<string | null>(null)
  const [uploadingField, setUploadingField] = useState<string | null>(null)

  // Dynamic sections
  const [features, setFeatures] = useState<DynamicItem[]>([emptyItem(), emptyItem(), emptyItem()])
  const [steps, setSteps] = useState<DynamicItem[]>([emptyItem(), emptyItem(), emptyItem()])
  const [packages, setPackages] = useState<PackageItem[]>([emptyPackage(), emptyPackage(), emptyPackage()])
  const [showcaseSteps, setShowcaseSteps] = useState<ShowcaseStep[]>([emptyStep(), emptyStep(), emptyStep(), emptyStep()])
  const [heroImages, setHeroImages] = useState<HeroImage[]>([
    { src: '/assets/hero-1.png', alt: 'Why Us - Be Fluent' },
    { src: '/assets/hero-2.png', alt: 'Live Sessions - Be Fluent' },
    { src: '/assets/hero-3.png', alt: 'Interactive Learning - Be Fluent' },
    { src: '/assets/hero-4.png', alt: 'Unlock Your Potential - Be Fluent' },
  ])

  useEffect(() => { fetchContent() }, [])

  /* ── Fetch ──────────────────────────────────────────── */
  async function fetchContent() {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/page-content?page=${PAGE}`)
      if (!res.ok) return
      const data: Array<{ section: string; field: string; value: string }> = await res.json()
      const map: Record<string, string> = {}
      data.forEach(d => { map[`${d.section}__${d.field}`] = d.value })
      setContent(map)

      // Features
      const maxFeat = getMaxIndex(data, 'features', 'feat')
      if (maxFeat > 0) setFeatures(Array.from({ length: maxFeat }, (_, i) => ({
        title:    map[`features__feat${i+1}_title_en`] || '',
        title_ar: map[`features__feat${i+1}_title_ar`] || '',
        desc:     map[`features__feat${i+1}_desc_ar`]  || '',
        icon:     map[`features__feat${i+1}_icon`]     || '',
      })))

      // Learning path steps
      const maxStep = getMaxIndex(data, 'learning_path', 'step')
      if (maxStep > 0) setSteps(Array.from({ length: maxStep }, (_, i) => ({
        title:    map[`learning_path__step${i+1}_title`]    || '',
        title_ar: map[`learning_path__step${i+1}_title_ar`] || '',
        desc:     map[`learning_path__step${i+1}_desc`]     || '',
        icon:     map[`learning_path__step${i+1}_icon`]     || '',
      })))

      // Packages
      const maxPkg = getMaxIndex(data, 'packages', 'pkg')
      if (maxPkg > 0) setPackages(Array.from({ length: maxPkg }, (_, i) => ({
        name:     map[`packages__pkg${i+1}_name`]     || '',
        price:    map[`packages__pkg${i+1}_price`]    || '',
        lessons:  map[`packages__pkg${i+1}_lessons`]  || '',
        duration: map[`packages__pkg${i+1}_duration`] || '',
        popular:  map[`packages__pkg${i+1}_popular`] === 'true',
        badge:    map[`packages__pkg${i+1}_badge`]    || '',
      })))

      // Showcase steps
      const maxSS = getMaxIndex(data, 'showcase', 'step')
      if (maxSS > 0) setShowcaseSteps(Array.from({ length: maxSS }, (_, i) => ({
        title: map[`showcase__step${i+1}_title`] || '',
        desc:  map[`showcase__step${i+1}_desc`]  || '',
      })))

      // Hero images
      const maxHI = getMaxIndex(data, 'hero_images', 'img')
      if (maxHI > 0) setHeroImages(Array.from({ length: maxHI }, (_, i) => ({
        src: map[`hero_images__img${i+1}_src`] || '',
        alt: map[`hero_images__img${i+1}_alt`] || '',
      })))

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

  /* ── POST helper ──────────────────────────────────── */
  async function postField(section: string, field: string, value: string) {
    return fetch('/api/admin/page-content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page: PAGE, section, field, value, type: 'text' })
    })
  }

  async function saveStaticSection(sectionId: string, fields: Array<{ id: string }>) {
    setSaving(sectionId)
    try {
      await Promise.all(fields.map(f => postField(sectionId, f.id, getVal(sectionId, f.id))))
      toast.success('تم الحفظ بنجاح ✓')
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
        calls.push(postField('features', `feat${n}_desc_ar`, f.desc))
        calls.push(postField('features', `feat${n}_icon`, f.icon))
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

  async function savePackages() {
    setSaving('packages')
    try {
      const calls: Promise<any>[] = []
      packages.forEach((p, i) => {
        const n = i + 1
        calls.push(postField('packages', `pkg${n}_name`,     p.name))
        calls.push(postField('packages', `pkg${n}_price`,    p.price))
        calls.push(postField('packages', `pkg${n}_lessons`,  p.lessons))
        calls.push(postField('packages', `pkg${n}_duration`, p.duration))
        calls.push(postField('packages', `pkg${n}_popular`,  String(p.popular)))
        calls.push(postField('packages', `pkg${n}_badge`,    p.badge))
      })
      await Promise.all(calls)
      toast.success('تم حفظ الباقات ✓')
    } catch { toast.error('فشل الحفظ') }
    finally { setSaving(null) }
  }

  async function saveShowcaseSteps() {
    setSaving('showcase')
    try {
      const calls: Promise<any>[] = []
      showcaseSteps.forEach((s, i) => {
        const n = i + 1
        calls.push(postField('showcase', `step${n}_title`, s.title))
        calls.push(postField('showcase', `step${n}_desc`,  s.desc))
      })
      await Promise.all(calls)
      toast.success('تم حفظ خطوات المسار ✓')
    } catch { toast.error('فشل الحفظ') }
    finally { setSaving(null) }
  }

  async function saveHeroImages() {
    setSaving('hero_images')
    try {
      const calls: Promise<any>[] = []
      heroImages.forEach((img, i) => {
        const n = i + 1
        calls.push(postField('hero_images', `img${n}_src`, img.src))
        calls.push(postField('hero_images', `img${n}_alt`, img.alt))
      })
      await Promise.all(calls)
      toast.success('تم حفظ صور الكاروسيل ✓')
    } catch { toast.error('فشل الحفظ') }
    finally { setSaving(null) }
  }

  /* ── Image upload ──────────────────────────────────── */
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

  async function handleHeroImageUpload(file: File, idx: number) {
    setUploadingField(`hero_img_${idx}`)
    const url = await uploadImageFile(file)
    if (url) {
      setHeroImages(imgs => imgs.map((x, i) => i === idx ? { ...x, src: url } : x))
      toast.success('تم رفع الصورة')
    } else toast.error('فشل رفع الصورة')
    setUploadingField(null)
  }

  const toggle = (id: string) => setExpandedSection(p => p === id ? null : id)

  /* ── DynamicCard component ─────────────────────── */
  function DynamicCard({ item, idx, total, label, hasTitle, onUpdate, onRemove, onAdd, onImgUpload, uploading }: {
    item: DynamicItem; idx: number; total: number; label: string; hasTitle?: boolean
    onUpdate: (i: number, k: keyof DynamicItem, v: string) => void
    onRemove: (i: number) => void; onAdd: () => void
    onImgUpload: (f: File, i: number) => void; uploading: boolean
  }) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm font-black text-gray-700">
            <div className="w-6 h-6 bg-emerald-600 text-white rounded-lg flex items-center justify-center text-xs font-black">{idx + 1}</div>
            {label} {idx + 1}
          </span>
          <div className="flex gap-1">
            {idx === total - 1 && (
              <button onClick={onAdd} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg text-xs font-bold transition">
                <Plus className="w-3 h-3" /> إضافة
              </button>
            )}
            {total > 1 && (
              <button onClick={() => onRemove(idx)} className="p-1.5 hover:bg-red-100 text-red-400 hover:text-red-600 rounded-lg transition">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
        <div className={`grid gap-3 ${hasTitle ? 'sm:grid-cols-2' : ''}`}>
          <div>
            <label className="text-xs font-bold text-gray-500 block mb-1">العنوان (عربي)</label>
            <input type="text" value={item.title_ar} onChange={e => onUpdate(idx, 'title_ar', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-400 outline-none bg-white" />
          </div>
          {hasTitle && (
            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1">العنوان (إنجليزي)</label>
              <input type="text" value={item.title} onChange={e => onUpdate(idx, 'title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-400 outline-none bg-white" />
            </div>
          )}
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 block mb-1">الوصف</label>
          <textarea value={item.desc} onChange={e => onUpdate(idx, 'desc', e.target.value)} rows={2}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-400 outline-none resize-none bg-white" />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 block mb-1">الأيقونة / الصورة</label>
          <ImageField value={item.icon} onChange={v => onUpdate(idx, 'icon', v)}
            onUpload={f => onImgUpload(f, idx)} uploading={uploading} compact />
        </div>
      </div>
    )
  }

  /* ─── RENDER ─────────────────────────────────────────── */
  return (
    <div className="space-y-5" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <LayoutTemplate className="w-6 h-6 text-emerald-600" />
            محرر الصفحات الكامل
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">تحكم في كل أقسام الصفحة الرئيسية — التغييرات تظهر فوراً على الموقع</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchContent} disabled={loading}
            className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl transition flex items-center gap-2 text-sm font-bold text-gray-600">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            تحديث
          </button>
          <a href="/" target="_blank"
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-sm font-bold transition border border-blue-200">
            <Eye className="w-4 h-4" />
            معاينة الموقع
          </a>
        </div>
      </div>

      {/* Section map */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { id: 'hero', label: 'الهيرو', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
          { id: 'hero_images', label: 'صور الكاروسيل', color: 'bg-blue-50 text-blue-700 border-blue-200' },
          { id: 'stats', label: 'الإحصاءات', color: 'bg-amber-50 text-amber-700 border-amber-200' },
          { id: 'features', label: 'المميزات', color: 'bg-purple-50 text-purple-700 border-purple-200' },
          { id: 'learning_path', label: 'مسار التعلم', color: 'bg-teal-50 text-teal-700 border-teal-200' },
          { id: 'showcase', label: 'قسم الخطوات', color: 'bg-slate-50 text-slate-700 border-slate-200' },
          { id: 'packages', label: 'الباقات', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
          { id: 'cta', label: 'الدعوة للعمل', color: 'bg-rose-50 text-rose-700 border-rose-200' },
          { id: 'contact', label: 'التواصل', color: 'bg-orange-50 text-orange-700 border-orange-200' },
        ].map(s => (
          <button key={s.id} onClick={() => toggle(s.id)}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition hover:opacity-80 ${s.color} ${expandedSection === s.id ? 'ring-2 ring-offset-1 ring-current' : ''}`}>
            {s.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40 bg-white rounded-2xl border border-gray-200">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">

          {/* ── SECTION 1: Hero ─────────────────────────────── */}
          <SectionCard id="hero" title="القسم الأول — Hero الرئيسي" icon={Palette} color="emerald"
            badge="العنوان الرئيسي والنص والصورة الخلفية"
            expanded={expandedSection === 'hero'} onToggle={() => toggle('hero')}
            onSave={() => saveStaticSection('hero', [
              { id: 'title_ar' }, { id: 'title_en' }, { id: 'subtitle_ar' }, { id: 'subtitle_en' }, { id: 'cta_text' }, { id: 'hero_bg' }
            ])} isSaving={saving === 'hero'}>
            {/* Live mini-preview */}
            <div className="p-4 bg-gray-900 rounded-2xl relative overflow-hidden aspect-video flex items-center justify-center text-center">
              {getVal('hero', 'hero_bg') && <img src={getVal('hero', 'hero_bg')} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />}
              <div className="relative z-10 space-y-2">
                <p className="text-white font-black text-lg">{getVal('hero', 'title_ar') || 'العنوان بالعربي'}</p>
                <p className="text-emerald-400 font-bold text-base">{getVal('hero', 'title_en') || 'Title in English'}</p>
                <p className="text-gray-300 text-xs max-w-xs mx-auto">{getVal('hero', 'subtitle_ar') || 'الوصف...'}</p>
                <span className="inline-block px-4 py-1 bg-emerald-500 text-white text-xs font-bold rounded-lg">
                  {getVal('hero', 'cta_text') || 'ابدأ الآن'}
                </span>
              </div>
              <div className="absolute top-2 right-2 bg-white/10 text-white text-[9px] px-2 py-0.5 rounded-full">معاينة مباشرة</div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <TF label="العنوان الرئيسي (عربي)" value={getVal('hero','title_ar')} onChange={v=>setVal('hero','title_ar',v)} placeholder="تعلم الإنجليزية" half />
              <TF label="العنوان الرئيسي (إنجليزي)" value={getVal('hero','title_en')} onChange={v=>setVal('hero','title_en',v)} placeholder="Learn English" half />
              <TF label="العنوان الفرعي (عربي)" value={getVal('hero','subtitle_ar')} onChange={v=>setVal('hero','subtitle_ar',v)} type="textarea" placeholder="وصف..." half />
              <TF label="العنوان الفرعي (إنجليزي)" value={getVal('hero','subtitle_en')} onChange={v=>setVal('hero','subtitle_en',v)} type="textarea" placeholder="Description..." half />
              <TF label="نص زر الدعوة للعمل (CTA)" value={getVal('hero','cta_text')} onChange={v=>setVal('hero','cta_text',v)} placeholder="ابدأ رحلتك الآن" half />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1.5">صورة الخلفية</label>
              <ImageField value={getVal('hero','hero_bg')} onChange={v=>setVal('hero','hero_bg',v)}
                onUpload={f=>handleStaticImageUpload(f,'hero','hero_bg')} uploading={uploadingField==='hero__hero_bg'} />
            </div>
          </SectionCard>

          {/* ── SECTION 2: Hero Carousel Images ────────────── */}
          <SectionCard id="hero_images" title="القسم الثاني — صور الكاروسيل" icon={ImageIcon} color="blue"
            badge="الصور المتحركة في الهيرو" fieldCount={heroImages.length}
            expanded={expandedSection === 'hero_images'} onToggle={() => toggle('hero_images')}
            onSave={saveHeroImages} isSaving={saving === 'hero_images'}>
            <div className="p-3 bg-blue-50 rounded-xl text-sm text-blue-800 border border-blue-200 flex items-start gap-2">
              <ImageIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>هذه الصور تظهر في الكاروسيل المتحرك بجانب العنوان الرئيسي. يمكنك تغييرها أو إضافة صور جديدة.</span>
            </div>
            {heroImages.map((img, idx) => (
              <div key={idx} className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm font-black text-gray-700">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-lg flex items-center justify-center text-xs font-black">{idx + 1}</div>
                    صورة {idx + 1}
                  </span>
                  <div className="flex gap-1">
                    {idx === heroImages.length - 1 && heroImages.length < 8 && (
                      <button onClick={() => setHeroImages(i => [...i, { src: '', alt: '' }])}
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-xs font-bold transition">
                        <Plus className="w-3 h-3" /> إضافة صورة
                      </button>
                    )}
                    {heroImages.length > 1 && (
                      <button onClick={() => setHeroImages(i => i.filter((_, j) => j !== idx))}
                        className="p-1.5 hover:bg-red-100 text-red-400 hover:text-red-600 rounded-lg transition">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <ImageField value={img.src} onChange={v => setHeroImages(imgs => imgs.map((x,i)=>i===idx?{...x,src:v}:x))}
                  onUpload={f => handleHeroImageUpload(f, idx)} uploading={uploadingField===`hero_img_${idx}`} compact />
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">النص البديل (Alt)</label>
                  <input type="text" value={img.alt} onChange={e => setHeroImages(imgs => imgs.map((x,i)=>i===idx?{...x,alt:e.target.value}:x))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-400 outline-none bg-white"
                    placeholder="وصف الصورة..." />
                </div>
              </div>
            ))}
          </SectionCard>

          {/* ── SECTION 3: Stats ────────────────────────────── */}
          <SectionCard id="stats" title="القسم الثالث — الإحصاءات والأرقام" icon={BarChart3 as any} color="amber"
            badge="4 إحصاءات تظهر تحت الهيرو"
            expanded={expandedSection === 'stats'} onToggle={() => toggle('stats')}
            onSave={() => saveStaticSection('stats', [1,2,3,4].flatMap(n=>[
              {id:`stat${n}_num`},{id:`stat${n}_label_ar`},{id:`stat${n}_label_en`}
            ]))} isSaving={saving === 'stats'}>
            <div className="grid sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-amber-100 text-amber-700 rounded-lg flex items-center justify-center text-sm font-black">{n}</div>
                    <span className="text-sm font-bold text-gray-700">الإحصائية {n}</span>
                    {getVal('stats',`stat${n}_num`) && (
                      <span className="text-2xl font-black text-emerald-600 mr-auto">{getVal('stats',`stat${n}_num`)}</span>
                    )}
                  </div>
                  <TF label="الرقم / القيمة" value={getVal('stats',`stat${n}_num`)} onChange={v=>setVal('stats',`stat${n}_num`,v)} placeholder="1000+" />
                  <TF label="الوصف (عربي)" value={getVal('stats',`stat${n}_label_ar`)} onChange={v=>setVal('stats',`stat${n}_label_ar`,v)} placeholder="طالب نشط" />
                  <TF label="الوصف (إنجليزي)" value={getVal('stats',`stat${n}_label_en`)} onChange={v=>setVal('stats',`stat${n}_label_en`,v)} placeholder="Active Students" />
                </div>
              ))}
            </div>
          </SectionCard>

          {/* ── SECTION 4: Features ─────────────────────────── */}
          <SectionCard id="features" title="القسم الرابع — المميزات (لماذا Be Fluent؟)" icon={Star} color="purple"
            badge="بطاقات المميزات الظاهرة في قسم المميزات وقسم لماذا نحن"
            fieldCount={features.length}
            expanded={expandedSection === 'features'} onToggle={() => toggle('features')}
            onSave={saveFeatures} isSaving={saving === 'features'}>
            <div className="p-3 bg-purple-50 rounded-xl text-sm text-purple-800 border border-purple-200 flex items-start gap-2">
              <Star className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>هذه المميزات تظهر في قسمين: قسم "المميزات" العلوي وقسم "لماذا تختار Be Fluent؟" في الأسفل. الـ 3 مميزات الأولى تظهر في كلا القسمين.</span>
            </div>
            {features.map((feat, idx) => (
              <DynamicCard key={idx} item={feat} idx={idx} total={features.length} label="ميزة" hasTitle
                onUpdate={(i, k, v) => setFeatures(f => f.map((x, j) => j === i ? { ...x, [k]: v } : x))}
                onRemove={i => setFeatures(f => f.filter((_, j) => j !== i))}
                onAdd={() => setFeatures(f => [...f, emptyItem()])}
                onImgUpload={(file, i) => handleDynamicImageUpload(file, 'features', i)}
                uploading={uploadingField === `features_${idx}`} />
            ))}
            {features.length === 0 && (
              <button onClick={() => setFeatures([emptyItem()])}
                className="w-full py-4 border-2 border-dashed border-purple-300 rounded-2xl text-purple-600 font-bold text-sm flex items-center justify-center gap-2 hover:bg-purple-50 transition">
                <Plus className="w-4 h-4" /> إضافة ميزة
              </button>
            )}
          </SectionCard>

          {/* ── SECTION 5: Learning Path ─────────────────────── */}
          <SectionCard id="learning_path" title="القسم الخامس — مسار التعلم" icon={Target} color="teal"
            badge="خطوات الرحلة التعليمية الظاهرة بجانب الخريطة"
            fieldCount={steps.length}
            expanded={expandedSection === 'learning_path'} onToggle={() => toggle('learning_path')}
            onSave={saveSteps} isSaving={saving === 'learning_path'}>
            {steps.map((s, idx) => (
              <DynamicCard key={idx} item={s} idx={idx} total={steps.length} label="خطوة"
                onUpdate={(i, k, v) => setSteps(st => st.map((x, j) => j === i ? { ...x, [k]: v } : x))}
                onRemove={i => setSteps(st => st.filter((_, j) => j !== i))}
                onAdd={() => setSteps(st => [...st, emptyItem()])}
                onImgUpload={(file, i) => handleDynamicImageUpload(file, 'steps', i)}
                uploading={uploadingField === `steps_${idx}`} />
            ))}
            {steps.length === 0 && (
              <button onClick={() => setSteps([emptyItem()])}
                className="w-full py-4 border-2 border-dashed border-teal-300 rounded-2xl text-teal-600 font-bold text-sm flex items-center justify-center gap-2 hover:bg-teal-50 transition">
                <Plus className="w-4 h-4" /> إضافة خطوة
              </button>
            )}
          </SectionCard>

          {/* ── SECTION 6: Showcase Steps ────────────────────── */}
          <SectionCard id="showcase" title="القسم السادس — خطوات رحلة الإتقان" icon={Zap} color="indigo"
            badge="القسم الداكن — خطوات التسجيل حتى الاحتراف" fieldCount={showcaseSteps.length}
            expanded={expandedSection === 'showcase'} onToggle={() => toggle('showcase')}
            onSave={saveShowcaseSteps} isSaving={saving === 'showcase'}>
            <div className="p-3 bg-indigo-50 rounded-xl text-sm text-indigo-800 border border-indigo-200 flex items-start gap-2">
              <Zap className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>هذه الخطوات تظهر في القسم الداكن الذي يشرح رحلة الطالب من التسجيل حتى الاحتراف.</span>
            </div>
            {showcaseSteps.map((s, idx) => (
              <div key={idx} className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm font-black text-gray-700">
                    <div className="w-6 h-6 bg-indigo-600 text-white rounded-lg flex items-center justify-center text-xs font-black">{idx + 1}</div>
                    الخطوة {idx + 1}
                  </span>
                  <div className="flex gap-1">
                    {idx === showcaseSteps.length - 1 && (
                      <button onClick={() => setShowcaseSteps(s => [...s, emptyStep()])}
                        className="flex items-center gap-1 px-3 py-1.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg text-xs font-bold transition">
                        <Plus className="w-3 h-3" /> إضافة
                      </button>
                    )}
                    {showcaseSteps.length > 1 && (
                      <button onClick={() => setShowcaseSteps(s => s.filter((_, j) => j !== idx))}
                        className="p-1.5 hover:bg-red-100 text-red-400 hover:text-red-600 rounded-lg transition">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <TF label="العنوان" value={s.title} onChange={v => setShowcaseSteps(ss => ss.map((x,i) => i===idx?{...x,title:v}:x))} placeholder={`الخطوة ${idx+1}...`} />
                <TF label="الوصف" value={s.desc} onChange={v => setShowcaseSteps(ss => ss.map((x,i) => i===idx?{...x,desc:v}:x))} type="textarea" placeholder="وصف الخطوة..." />
              </div>
            ))}
          </SectionCard>

          {/* ── SECTION 7: Packages ──────────────────────────── */}
          <SectionCard id="packages" title="القسم السابع — الباقات التعليمية" icon={Package} color="rose"
            badge="الباقات المعروضة على الصفحة الرئيسية" fieldCount={packages.length}
            expanded={expandedSection === 'packages'} onToggle={() => toggle('packages')}
            onSave={savePackages} isSaving={saving === 'packages'}>
            {packages.map((pkg, idx) => (
              <div key={idx} className={`border rounded-2xl p-5 space-y-3 ${pkg.popular ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm font-black text-gray-700">
                    <div className={`w-6 h-6 ${pkg.popular ? 'bg-emerald-600' : 'bg-rose-600'} text-white rounded-lg flex items-center justify-center text-xs font-black`}>{idx + 1}</div>
                    الباقة {idx + 1}
                    {pkg.popular && <span className="px-2 py-0.5 bg-emerald-200 text-emerald-800 rounded-full text-xs font-bold">الأكثر طلباً</span>}
                  </span>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 text-xs font-bold text-gray-600 cursor-pointer">
                      <input type="checkbox" checked={pkg.popular}
                        onChange={e => setPackages(ps => ps.map((x, i) => i === idx ? { ...x, popular: e.target.checked } : x))}
                        className="accent-emerald-600" />
                      الأكثر طلباً
                    </label>
                    <div className="flex gap-1">
                      {idx === packages.length - 1 && packages.length < 6 && (
                        <button onClick={() => setPackages(p => [...p, emptyPackage()])}
                          className="flex items-center gap-1 px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-lg text-xs font-bold transition">
                          <Plus className="w-3 h-3" /> إضافة
                        </button>
                      )}
                      {packages.length > 1 && (
                        <button onClick={() => setPackages(p => p.filter((_, j) => j !== idx))}
                          className="p-1.5 hover:bg-red-100 text-red-400 hover:text-red-600 rounded-lg transition">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <TF label="اسم الباقة" value={pkg.name} onChange={v => setPackages(ps => ps.map((x,i) => i===idx?{...x,name:v}:x))} placeholder="الباقة الشهرية" half />
                  <TF label="السعر (بدون عملة)" value={pkg.price} onChange={v => setPackages(ps => ps.map((x,i) => i===idx?{...x,price:v}:x))} placeholder="1500" half />
                  <TF label="عدد الحصص" value={pkg.lessons} onChange={v => setPackages(ps => ps.map((x,i) => i===idx?{...x,lessons:v}:x))} placeholder="8" half />
                  <TF label="المدة" value={pkg.duration} onChange={v => setPackages(ps => ps.map((x,i) => i===idx?{...x,duration:v}:x))} placeholder="شهر واحد" half />
                  <TF label="نص الشارة (اختياري)" value={pkg.badge} onChange={v => setPackages(ps => ps.map((x,i) => i===idx?{...x,badge:v}:x))} placeholder="الأكثر طلباً" half />
                </div>
              </div>
            ))}
          </SectionCard>

          {/* ── SECTION 8: CTA ───────────────────────────────── */}
          <SectionCard id="cta" title="القسم الثامن — الدعوة للعمل (CTA)" icon={Megaphone as any} color="orange"
            badge="القسم الأخضر في نهاية الصفحة"
            expanded={expandedSection === 'cta'} onToggle={() => toggle('cta')}
            onSave={() => saveStaticSection('cta', [{ id: 'title' }, { id: 'subtitle' }, { id: 'button_text' }])}
            isSaving={saving === 'cta'}>
            <div className="p-4 bg-gradient-to-r from-emerald-600 to-teal-500 rounded-2xl text-center">
              <p className="text-white font-black text-xl mb-2">{getVal('cta','title') || 'جاهز لبدء رحلتك؟'}</p>
              <p className="text-white/80 text-sm mb-3">{getVal('cta','subtitle') || 'انضم لآلاف الطلاب الذين غيروا حياتهم...'}</p>
              <span className="px-6 py-2 bg-white text-emerald-700 font-bold rounded-xl text-sm">
                {getVal('cta','button_text') || 'سجل الآن مجاناً'}
              </span>
            </div>
            <TF label="العنوان الرئيسي" value={getVal('cta','title')} onChange={v=>setVal('cta','title',v)} placeholder="جاهز لبدء رحلتك؟" />
            <TF label="النص الفرعي" value={getVal('cta','subtitle')} onChange={v=>setVal('cta','subtitle',v)} type="textarea" placeholder="انضم لآلاف الطلاب..." />
            <TF label="نص الزر" value={getVal('cta','button_text')} onChange={v=>setVal('cta','button_text',v)} placeholder="سجل الآن مجاناً" />
          </SectionCard>

          {/* ── SECTION 9: Contact ───────────────────────────── */}
          <SectionCard id="contact" title="القسم التاسع — معلومات التواصل" icon={Phone as any} color="emerald"
            badge="واتساب، إيميل، سوشيال ميديا"
            expanded={expandedSection === 'contact'} onToggle={() => toggle('contact')}
            onSave={() => saveStaticSection('contact', [
              { id: 'whatsapp' }, { id: 'email' }, { id: 'facebook' }, { id: 'instagram' }, { id: 'twitter' }, { id: 'youtube' }
            ])} isSaving={saving === 'contact'}>
            <div className="grid sm:grid-cols-2 gap-4">
              <TF label="رقم واتساب (بدون +)" value={getVal('contact','whatsapp')} onChange={v=>setVal('contact','whatsapp',v)} placeholder="201091515594" half />
              <TF label="البريد الإلكتروني" value={getVal('contact','email')} onChange={v=>setVal('contact','email',v)} placeholder="info@befluent-edu.online" half />
              <TF label="رابط فيسبوك" value={getVal('contact','facebook')} onChange={v=>setVal('contact','facebook',v)} type="url" placeholder="https://facebook.com/..." half />
              <TF label="رابط إنستغرام" value={getVal('contact','instagram')} onChange={v=>setVal('contact','instagram',v)} type="url" placeholder="https://instagram.com/..." half />
              <TF label="رابط تويتر / X" value={getVal('contact','twitter')} onChange={v=>setVal('contact','twitter',v)} type="url" placeholder="https://x.com/..." half />
              <TF label="رابط يوتيوب" value={getVal('contact','youtube')} onChange={v=>setVal('contact','youtube',v)} type="url" placeholder="https://youtube.com/..." half />
            </div>
            <a href={`https://api.whatsapp.com/send/?phone=${getVal('contact','whatsapp')||'201091515594'}`} target="_blank"
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-xl text-sm font-bold hover:bg-green-200 transition">
              <MessageCircle className="w-4 h-4" /> اختبر رابط الواتساب
            </a>
          </SectionCard>

        </div>
      )}
    </div>
  )
}

function BarChart3(props: any) { return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg> }
function Megaphone(props: any) { return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m3 11 19-9-9 19-2-8-8-2z"/></svg> }
function Phone(props: any) { return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.07 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3 1.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 8a16 16 0 0 0 6 6l.27-.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21 16z"/></svg> }
