'use client';

import { useState, useEffect } from 'react';
import { Save, Loader2, MessageCircle, Phone, Mail, Facebook, Instagram, Layout, Map as MapIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function SettingsPage() {
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
        toast.success('تم تحديث الإعدادات بنجاح');
      } else {
        toast.error('فشل في تحديث الإعدادات');
      }
    } catch (error) {
      toast.error('حدث خطأ غير متوقع');
    } finally {
      setSaving(false);
    }
  };

  const addStep = () => {
    const newStep = {
      id: Math.random().toString(36).substr(2, 9),
      title: 'خطوة جديدة',
      desc: 'وصف الخطوة هنا...',
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
    <div className="max-w-4xl mx-auto p-6 space-y-8" dir="rtl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900">إعدادات المنصة</h1>
          <p className="text-gray-500">إدارة معلومات التواصل ومحتوى الصفحة الرئيسية</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-[#10B981] text-white rounded-xl font-bold hover:bg-[#059669] transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          حفظ التغييرات
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact Settings */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-[#10B981] mb-4">
            <Phone className="w-5 h-5" />
            <h2 className="font-bold text-lg">معلومات التواصل</h2>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">رقم الواتساب (بدون +)</label>
            <input
              type="text"
              value={settings.whatsappNumber || ''}
              onChange={e => setSettings({ ...settings, whatsappNumber: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/10 outline-none transition-all"
              placeholder="201091515594"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">رقم الدعم الفني</label>
            <input
              type="text"
              value={settings.supportNumber || ''}
              onChange={e => setSettings({ ...settings, supportNumber: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/10 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">البريد الإلكتروني للدعم</label>
            <input
              type="email"
              value={settings.supportEmail || ''}
              onChange={e => setSettings({ ...settings, supportEmail: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/10 outline-none transition-all"
            />
          </div>
        </div>

        {/* Social Media */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-[#10B981] mb-4">
            <Layout className="w-5 h-5" />
            <h2 className="font-bold text-lg">روابط التواصل الاجتماعي</h2>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <Facebook className="w-4 h-4" /> فيسبوك
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
              <Instagram className="w-4 h-4" /> انستجرام
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
        <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-[#10B981] mb-4">
            <Layout className="w-5 h-5" />
            <h2 className="font-bold text-lg">محتوى الصفحة الرئيسية</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">العنوان الرئيسي (عربي)</label>
              <input
                type="text"
                value={settings.heroTitleAr || ''}
                onChange={e => setSettings({ ...settings, heroTitleAr: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/10 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">العنوان الفرعي (عربي)</label>
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
        <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-[#10B981]">
              <MapIcon className="w-5 h-5" />
              <h2 className="font-bold text-lg">إدارة خطة التعلم (Learning Path)</h2>
            </div>
            <button
              onClick={addStep}
              className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg font-bold hover:bg-emerald-100 transition-colors flex items-center gap-2"
            >
              + إضافة خطوة
            </button>
          </div>

          <div className="space-y-4">
            {pathSteps.map((step, index) => (
              <div key={step.id} className="p-4 border border-gray-100 rounded-xl bg-gray-50/50 space-y-4 relative group">
                <button 
                  onClick={() => removeStep(step.id)}
                  className="absolute top-4 left-4 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  حذف
                </button>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500">العنوان</label>
                    <input
                      type="text"
                      value={step.title}
                      onChange={e => updateStep(step.id, 'title', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[#10B981] outline-none text-sm"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-bold text-gray-500">الوصف</label>
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
                    <label className="text-xs font-bold text-gray-500">الأيقونة (Lucide name)</label>
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
                    <label className="text-xs font-bold text-gray-500">لون النص (Tailwind)</label>
                    <input
                      type="text"
                      value={step.color}
                      onChange={e => updateStep(step.id, 'color', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[#10B981] outline-none text-sm"
                      placeholder="text-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500">لون الخلفية</label>
                    <input
                      type="text"
                      value={step.bgColor}
                      onChange={e => updateStep(step.id, 'bgColor', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[#10B981] outline-none text-sm"
                      placeholder="bg-blue-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500">لون الحدود</label>
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
                لا توجد خطوات مضافة حالياً. اضغط على "إضافة خطوة" للبدء.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
