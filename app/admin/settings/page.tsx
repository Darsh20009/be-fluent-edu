'use client';

import { useState, useEffect } from 'react';
import { Save, Loader2, MessageCircle, Phone, Mail, Facebook, Instagram, Layout, Map as MapIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useTheme } from '@/lib/contexts/ThemeContext';
import { localeText, localeDirection } from '@/lib/locale';

export default function SettingsPage() {
  const { language } = useTheme();
  const t = (ar: string, en: string) => localeText(language, ar, en);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    whatsappNumber: '',
    supportNumber: '',
    supportEmail: '',
    facebookUrl: '',
    instagramUrl: '',
    heroTitle: '',
    heroTitleAr: '',
    heroSubtitle: '',
    heroSubtitleAr: '',
    learningPath: '[]'
  });

  const [pathSteps, setPathSteps] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setSettings(data);
          try {
            const steps = JSON.parse(data.learningPath || '[]');
            setPathSteps(Array.isArray(steps) ? steps : []);
          } catch (e) {
            setPathSteps([]);
          }
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updatedSettings = {
        ...settings,
        learningPath: JSON.stringify(pathSteps)
      };
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSettings)
      });
      if (res.ok) {
        toast.success(t('تم تحديث الإعدادات بنجاح', 'Settings updated successfully'));
      } else {
        toast.error(t('فشل في تحديث الإعدادات', 'Failed to update settings'));
      }
    } catch (error) {
      toast.error(t('حدث خطأ غير متوقع', 'An unexpected error occurred'));
    } finally {
      setSaving(false);
    }
  };

  const addStep = () => {
    const newStep = {
      id: Math.random().toString(36).substr(2, 9),
      title: t('خطوة جديدة', 'New step'),
      desc: t('وصف الخطوة هنا...', 'Step description here...'),
      icon: 'Target',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    };
    setPathSteps([...pathSteps, newStep]);
  };

  const removeStep = (id: string) => {
    setPathSteps(pathSteps.filter(s => s.id !== id));
  };

  const updateStep = (id: string, field: string, value: string) => {
    setPathSteps(pathSteps.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#10B981]" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 bg-[#f4f1e9] p-4 text-[#1f2924] [&_button]:rounded-none [&_input]:rounded-none [&_select]:rounded-none [&_textarea]:rounded-none sm:p-8" dir={localeDirection(language)}>
      <div className="mb-6 flex items-center justify-between border-b border-[#d7d4ca] pb-5">
        <div>
          <p className="mb-1 text-[10px] font-bold tracking-[0.18em] text-[#758178]">PLATFORM CONTROL</p>
          <h1 className="text-3xl font-black tracking-tight text-[#174d3a]">{t('إعدادات المنصة', 'Platform settings')}</h1>
          <p className="text-sm text-[#667168]">{t('إدارة معلومات التواصل ومحتوى الصفحة الرئيسية', 'Manage contact information and homepage content')}</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-[#174d3a] px-5 py-3 text-sm font-bold text-[#f8f6f0] transition-colors hover:bg-[#123c2d] disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {t('حفظ التغييرات', 'Save changes')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact Settings */}
        <div className="space-y-4 border border-[#d7d4ca] bg-[#f8f6f0] p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-[#174d3a]">
            <Phone className="w-5 h-5" />
            <h2 className="font-bold text-lg">{t('معلومات التواصل', 'Contact information')}</h2>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">{t('رقم الواتساب (بدون +)', 'WhatsApp number (without +)')}</label>
            <input
              type="text"
              value={settings.whatsappNumber || ''}
              onChange={e => setSettings({ ...settings, whatsappNumber: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/10 outline-none transition-all"
              placeholder="201091515594"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">{t('رقم الدعم الفني', 'Support phone')}</label>
            <input
              type="text"
              value={settings.supportNumber || ''}
              onChange={e => setSettings({ ...settings, supportNumber: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/10 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">{t('البريد الإلكتروني للدعم', 'Support email')}</label>
            <input
              type="email"
              value={settings.supportEmail || ''}
              onChange={e => setSettings({ ...settings, supportEmail: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/10 outline-none transition-all"
            />
          </div>
        </div>

        {/* Social Media */}
        <div className="space-y-4 border border-[#d7d4ca] bg-[#f8f6f0] p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-[#174d3a]">
            <Layout className="w-5 h-5" />
            <h2 className="font-bold text-lg">{t('روابط التواصل الاجتماعي', 'Social media links')}</h2>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <Facebook className="w-4 h-4" /> {t('فيسبوك', 'Facebook')}
            </label>
            <input
              type="text"
              value={settings.facebookUrl || ''}
              onChange={e => setSettings({ ...settings, facebookUrl: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/10 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <Instagram className="w-4 h-4" /> {t('انستجرام', 'Instagram')}
            </label>
            <input
              type="text"
              value={settings.instagramUrl || ''}
              onChange={e => setSettings({ ...settings, instagramUrl: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/10 outline-none transition-all"
            />
          </div>
        </div>

        {/* Hero Content */}
        <div className="md:col-span-2 space-y-4 border border-[#d7d4ca] bg-[#f8f6f0] p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-[#174d3a]">
            <Layout className="w-5 h-5" />
            <h2 className="font-bold text-lg">{t('محتوى الصفحة الرئيسية', 'Homepage content')}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">{t('العنوان الرئيسي (عربي)', 'Main title (Arabic)')}</label>
              <input
                type="text"
                value={settings.heroTitleAr || ''}
                onChange={e => setSettings({ ...settings, heroTitleAr: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/10 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">{t('العنوان الفرعي (عربي)', 'Subtitle (Arabic)')}</label>
              <textarea
                value={settings.heroSubtitleAr || ''}
                onChange={e => setSettings({ ...settings, heroSubtitleAr: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/10 outline-none transition-all"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Learning Path Management */}
        <div className="md:col-span-2 space-y-6 border border-[#d7d4ca] bg-[#f8f6f0] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-[#174d3a]">
              <MapIcon className="w-5 h-5" />
              <h2 className="font-bold text-lg">{t('إدارة خطة التعلم (Learning Path)', 'Manage learning path')}</h2>
            </div>
            <button
              onClick={addStep}
              className="flex items-center gap-2 border border-[#b8c8ba] bg-[#e8eee8] px-4 py-2 text-sm font-bold text-[#174d3a] transition-colors hover:bg-[#d8e5d9]"
            >
              {t('إضافة خطوة', 'Add step')}
            </button>
          </div>

          <div className="space-y-4">
            {pathSteps.map((step, index) => (
              <div key={step.id} className="group relative space-y-4 border border-[#d7d4ca] bg-[#f4f1e9] p-4">
                <button 
                  onClick={() => removeStep(step.id)}
                  className="absolute top-4 left-4 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {t('حذف', 'Delete')}
                </button>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500">{t('العنوان', 'Title')}</label>
                    <input
                      type="text"
                      value={step.title}
                      onChange={e => updateStep(step.id, 'title', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[#10B981] outline-none text-sm"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-bold text-gray-500">{t('الوصف', 'Description')}</label>
                    <input
                      type="text"
                      value={step.desc}
                      onChange={e => updateStep(step.id, 'desc', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[#10B981] outline-none text-sm"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500">{t('الأيقونة (اسم Lucide)', 'Icon (Lucide name)')}</label>
                    <select
                      value={step.icon}
                      onChange={e => updateStep(step.id, 'icon', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[#10B981] outline-none text-sm"
                    >
                      <option value="Target">Target</option>
                      <option value="Video">Video</option>
                      <option value="Map">Map</option>
                      <option value="Users">Users</option>
                      <option value="Zap">Zap</option>
                      <option value="Star">Star</option>
                      <option value="GraduationCap">GraduationCap</option>
                      <option value="BookOpen">BookOpen</option>
                      <option value="MessageCircle">MessageCircle</option>
                      <option value="Award">Award</option>
                      <option value="Globe">Globe</option>
                      <option value="Cpu">Cpu</option>
                      <option value="CheckCircle">CheckCircle</option>
                      <option value="Clock">Clock</option>
                      <option value="HelpCircle">HelpCircle</option>
                      <option value="Info">Info</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500">{t('لون النص (Tailwind)', 'Text color (Tailwind)')}</label>
                    <input
                      type="text"
                      value={step.color}
                      onChange={e => updateStep(step.id, 'color', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[#10B981] outline-none text-sm"
                      placeholder="text-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500">{t('لون الخلفية', 'Background color')}</label>
                    <input
                      type="text"
                      value={step.bgColor}
                      onChange={e => updateStep(step.id, 'bgColor', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[#10B981] outline-none text-sm"
                      placeholder="bg-blue-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500">{t('لون الحدود', 'Border color')}</label>
                    <input
                      type="text"
                      value={step.borderColor}
                      onChange={e => updateStep(step.id, 'borderColor', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[#10B981] outline-none text-sm"
                      placeholder="border-blue-200"
                    />
                  </div>
                </div>
              </div>
            ))}
            {pathSteps.length === 0 && (
              <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-2xl text-gray-400">
                {t('لا توجد خطوات مضافة حالياً. اضغط على "إضافة خطوة" للبدء.', 'No steps added yet. Select "Add step" to get started.')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
