'use client';

import { useState, useEffect } from 'react';
import { Save, Loader2, MessageCircle, Phone, Mail, Facebook, Instagram, Layout } from 'lucide-react';
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
    heroSubtitleAr: ''
  });

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setSettings(data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        toast.success('Settings updated successfully');
      } else {
        toast.error('Failed to update settings');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setSaving(false);
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
      </div>
    </div>
  );
}
