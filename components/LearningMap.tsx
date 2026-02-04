'use client';

import React from 'react';
import { motion } from 'framer-motion';

const pathSteps = [
  { id: 1, title: 'تحديد الهدف', description: 'Goal Setting', x: 100, y: 400, color: '#3B82F6', status: 'completed' },
  { id: 2, title: 'الحصة التجريبية', description: 'Trial Session', x: 250, y: 300, color: '#10B981', status: 'current' },
  { id: 3, title: 'الخطة المخصصة', description: 'Personalized Plan', x: 400, y: 350, color: '#F59E0B', status: 'locked' },
  { id: 4, title: 'نظام المعلمين المزدوج', description: 'Dual Teacher System', x: 550, y: 200, color: '#EF4444', status: 'locked' },
  { id: 5, title: 'اختبارات قياس المستوى', description: 'Level Assessments', x: 750, y: 150, color: '#8B5CF6', status: 'locked' },
];

export default function LearningMap() {
  const generatePath = () => {
    return pathSteps.reduce((acc, point, i) => {
      if (i === 0) return `M ${point.x} ${point.y}`;
      // Use cubic bezier for smooth curves
      const prev = pathSteps[i - 1];
      const cx1 = prev.x + (point.x - prev.x) / 2;
      const cy1 = prev.y;
      const cx2 = prev.x + (point.x - prev.x) / 2;
      const cy2 = point.y;
      return `${acc} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${point.x} ${point.y}`;
    }, '');
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto h-[600px] bg-slate-50 rounded-2xl p-8 overflow-hidden border border-slate-200 shadow-sm">
      <svg viewBox="0 0 850 550" className="w-full h-full">
        {/* Background decorative elements */}
        <defs>
          <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* The Path */}
        <motion.path
          d={generatePath()}
          fill="none"
          stroke="url(#pathGradient)"
          strokeWidth="12"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />
        
        <motion.path
          d={generatePath()}
          fill="none"
          stroke="#E2E8F0"
          strokeWidth="4"
          strokeDasharray="8 8"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />

        {/* Connection points */}
        {pathSteps.map((step, index) => (
          <g key={step.id}>
            <motion.circle
              cx={step.x}
              cy={step.y}
              r="24"
              fill="white"
              stroke={step.color}
              strokeWidth="4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.3 }}
              className="cursor-pointer shadow-lg"
              whileHover={{ scale: 1.2 }}
            />
            
            {step.status === 'completed' && (
              <motion.circle
                cx={step.x}
                cy={step.y}
                r="12"
                fill={step.color}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.3 + 0.2 }}
              />
            )}
            
            {step.status === 'current' && (
              <motion.circle
                cx={step.x}
                cy={step.y}
                r="12"
                fill={step.color}
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
            )}

            <foreignObject x={step.x - 60} y={step.y + 35} width="120" height="80">
              <div className="text-center">
                <p className="font-bold text-slate-800 text-sm leading-tight">{step.title}</p>
                <p className="text-[10px] text-slate-500">{step.description}</p>
              </div>
            </foreignObject>
          </g>
        ))}
      </svg>
      
      <div className="absolute bottom-6 right-6 bg-white p-4 rounded-xl border border-slate-100 shadow-sm max-w-xs">
        <h4 className="font-bold text-slate-800 text-sm mb-1">Your Progress</h4>
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div className="bg-blue-500 h-full w-2/5 rounded-full" />
        </div>
        <p className="text-[10px] text-slate-500 mt-2">Level 2: Vocabulary - 40% Complete</p>
      </div>
    </div>
  );
}
