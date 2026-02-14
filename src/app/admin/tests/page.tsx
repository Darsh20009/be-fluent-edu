'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, ChevronRight, LayoutList } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TestsAdminPage() {
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTest, setNewTest] = useState({ title: '', titleAr: '', level: 'BEGINNER' });

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const res = await fetch('/api/admin/tests');
      const data = await res.json();
      setTests(data);
    } catch (error) {
      toast.error('Failed to load tests');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTest = async () => {
    try {
      const res = await fetch('/api/admin/tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTest)
      });
      if (res.ok) {
        toast.success('Test created successfully');
        setShowAddModal(false);
        fetchTests();
      }
    } catch (error) {
      toast.error('Failed to create test');
    }
  };

  const deleteTest = async (id: string) => {
    if (!confirm('Are you sure you want to delete this test?')) return;
    try {
      const res = await fetch(`/api/admin/tests/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Test deleted');
        fetchTests();
      }
    } catch (error) {
      toast.error('Failed to delete test');
    }
  };

  const levels = ['BEGINNER', 'ELEMENTARY', 'INTERMEDIATE', 'UPPER_INTERMEDIATE', 'ADVANCED'];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <LayoutList className="w-6 h-6" />
          Placement Tests Management
        </h1>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:opacity-90 transition"
        >
          <Plus className="w-4 h-4" /> Add New Test
        </button>
      </div>

      <div className="grid gap-6">
        {levels.map(level => (
          <div key={level} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex justify-between items-center">
              <h2 className="font-semibold text-gray-700">{level}</h2>
              <span className="text-xs text-gray-400">
                {tests.filter(t => t.level === level).length} Tests
              </span>
            </div>
            <div className="divide-y divide-gray-50">
              {tests.filter(t => t.level === level).map(test => (
                <div key={test.id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition">
                  <div>
                    <h3 className="font-medium text-gray-900">{test.title}</h3>
                    <p className="text-sm text-gray-500">{test.titleAr}</p>
                    <p className="text-xs text-gray-400 mt-1">{test.questions?.length || 0} Questions</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <a 
                      href={`/admin/tests/${test.id}`}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Edit Questions"
                    >
                      <Edit2 className="w-4 h-4" />
                    </a>
                    <button 
                      onClick={() => deleteTest(test.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Delete Test"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {tests.filter(t => t.level === level).length === 0 && (
                <div className="p-4 text-center text-gray-400 text-sm">No tests for this level</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4">Add New Placement Test</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title (English)</label>
                <input 
                  type="text" 
                  value={newTest.title}
                  onChange={e => setNewTest({...newTest, title: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title (Arabic)</label>
                <input 
                  type="text" 
                  value={newTest.titleAr}
                  onChange={e => setNewTest({...newTest, titleAr: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20 text-right"
                  dir="rtl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                <select 
                  value={newTest.level}
                  onChange={e => setNewTest({...newTest, level: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {levels.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button 
                onClick={handleAddTest}
                className="flex-1 bg-primary text-white py-2 rounded-lg font-medium hover:opacity-90"
              >
                Create
              </button>
              <button 
                onClick={() => setShowAddModal(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
