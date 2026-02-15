'use client';

import { useState, useEffect } from 'react';
import { Save, Loader2, Phone, Mail, Facebook, Instagram, Layout, Map, Sparkles, Plus, Trash2 } from 'lucide-react';
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
    heroTitleAr: '',
    heroSubtitleAr: '',
    learningPath: '[]',
    whyUs: '[]'
  });

  const [learningPath, setLearningPath] = useState<any[]>([]);
  const [whyUs, setWhyUs] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setSettings(data);
          try {
            setLearningPath(JSON.parse(data.learningPath || '[]'));
            setWhyUs(JSON.parse(data.whyUs || '[]'));
          } catch (e) {
            setLearningPath([]);
            setWhyUs([]);
          }
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...settings,
        learningPath: JSON.stringify(learningPath),
        whyUs: JSON.stringify(whyUs)
      };
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        toast.success('تم حفظ الإعدادات بنجاح');
      } else {
        toast.error('فشل حفظ الإعدادات');
      }
    } catch (error) {
      toast.error('حدث خطأ غير متوقع');
    } finally {
      setSaving(false);
    }
  };

  const addItem = (type: 'path' | 'why') => {
    if (type === 'path') {
      setLearningPath([...learningPath, { title: '', desc: '', icon: 'Target' }]);
    } else {
      setWhyUs([...whyUs, { title: '', desc: '', icon: 'CheckCircle' }]);
    }
  };

  const removeItem = (type: 'path' | 'why', index: number) => {
    if (type === 'path') {
      setLearningPath(learningPath.filter((_, i) => i !== index));
    } else {
      setWhyUs(whyUs.filter((_, i) => i !== index));
    }
  };

  const updateItem = (type: 'path' | 'why', index: number, field: string, value: string) => {
    if (type === 'path') {
      const newList = [...learningPath];
      newList[index][field] = value;
      setLearningPath(newList);
    } else {
      const newList = [...whyUs];
      newList[index][field] = value;
      setWhyUs(newList);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#10B981]" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8" dir="rtl">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900">إعدادات المنصة</h1>
          <p className="text-gray-500">تحكم كامل في محتوى الصفحة الرئيسية ومعلومات التواصل</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-[#10B981] text-white rounded-2xl font-black hover:bg-[#059669] shadow-lg shadow-emerald-200 transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          حفظ كل التغييرات
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Basic Info & Social */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-[#10B981] mb-2">
              <Phone className="w-6 h-6" />
              <h2 className="font-bold text-xl">معلومات التواصل</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">رقم الواتساب (بدون +)</label>
                <input
                  type="text"
                  value={settings.whatsappNumber || ''}
                  onChange={e => setSettings({ ...settings, whatsappNumber: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#10B981] outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">البريد الإلكتروني</label>
                <input
                  type="email"
                  value={settings.supportEmail || ''}
                  onChange={e => setSettings({ ...settings, supportEmail: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#10B981] outline-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-[#10B981] mb-2">
              <Facebook className="w-6 h-6" />
              <h2 className="font-bold text-xl">روابط التواصل</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">رابط فيسبوك</label>
                <input
                  type="text"
                  value={settings.facebookUrl || ''}
                  onChange={e => setSettings({ ...settings, facebookUrl: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#10B981] outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">رابط انستجرام</label>
                <input
                  type="text"
                  value={settings.instagramUrl || ''}
                  onChange={e => setSettings({ ...settings, instagramUrl: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#10B981] outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center gap-2 text-[#10B981]">
            <Layout className="w-6 h-6" />
            <h2 className="font-bold text-xl">محتوى واجهة الصفحة الرئيسية (Hero)</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">العنوان الرئيسي</label>
              <input
                type="text"
                value={settings.heroTitleAr || ''}
                onChange={e => setSettings({ ...settings, heroTitleAr: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#10B981] outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">العنوان الفرعي / الوصف</label>
              <textarea
                value={settings.heroSubtitleAr || ''}
                onChange={e => setSettings({ ...settings, heroSubtitleAr: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#10B981] outline-none"
              />
            </div>
          </div>
        </div>

        {/* Learning Path Management */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#10B981]">
              <Map className="w-6 h-6" />
              <h2 className="font-bold text-xl">خريطة التعلم (الخطوات)</h2>
            </div>
            <button
              onClick={() => addItem('path')}
              className="flex items-center gap-2 text-sm font-bold text-[#10B981] bg-emerald-50 px-4 py-2 rounded-xl hover:bg-emerald-100 transition-colors"
            >
              <Plus className="w-4 h-4" /> إضافة خطوة
            </button>
          </div>
          
          <div className="space-y-4">
            {learningPath.map((item, index) => (
              <div key={index} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-4">
                <div className="flex justify-between items-start">
                  <span className="bg-emerald-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">{index + 1}</span>
                  <button onClick={() => removeItem('path', index)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    placeholder="عنوان الخطوة"
                    value={item.title}
                    onChange={e => updateItem('path', index, 'title', e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none focus:border-[#10B981]"
                  />
                  <input
                    placeholder="الوصف"
                    value={item.desc}
                    onChange={e => updateItem('path', index, 'desc', e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none focus:border-[#10B981]"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Why Us Management */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#10B981]">
              <Sparkles className="w-6 h-6" />
              <h2 className="font-bold text-xl">لماذا نحن؟</h2>
            </div>
            <button
              onClick={() => addItem('why')}
              className="flex items-center gap-2 text-sm font-bold text-[#10B981] bg-emerald-50 px-4 py-2 rounded-xl hover:bg-emerald-100 transition-colors"
            >
              <Plus className="w-4 h-4" /> إضافة ميزة
            </button>
          </div>
          
          <div className="space-y-4">
            {whyUs.map((item, index) => (
              <div key={index} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-4">
                <div className="flex justify-between items-start">
                  <span className="bg-[#10B981] text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">{index + 1}</span>
                  <button onClick={() => removeItem('why', index)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    placeholder="العنوان"
                    value={item.title}
                    onChange={e => updateItem('why', index, 'title', e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none focus:border-[#10B981]"
                  />
                  <input
                    placeholder="الوصف"
                    value={item.desc}
                    onChange={e => updateItem('why', index, 'desc', e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none focus:border-[#10B981]"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
