import React from 'react';
import LearningMap from '@/components/LearningMap';

export default function LearningPathPage() {
  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl">
            Your Learning Journey
          </h1>
          <p className="mt-4 text-xl text-slate-600 max-w-2xl mx-auto">
            Interactive map of your progress. Complete milestones to unlock new topics and master the language.
          </p>
        </div>

        <div className="mt-10">
          <LearningMap />
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4">
              <span className="text-xl">🏆</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Milestones</h3>
            <p className="text-slate-600 text-sm">Every point on the map represents a significant milestone in your learning journey.</p>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-4">
              <span className="text-xl">⚡</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Interactive</h3>
            <p className="text-slate-600 text-sm">Click on any unlocked node to start your lessons or review completed content.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-4">
              <span className="text-xl">📊</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Progressive</h3>
            <p className="text-slate-600 text-sm">Content adapts to your pace. The path unlocks as you demonstrate mastery.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
