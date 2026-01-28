'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface CertificateProps {
  studentName: string;
  level: string;
  date: string;
  certificateId: string;
}

export default function CertificateTemplate({ studentName, level, date, certificateId }: CertificateProps) {
  return (
    <div className="relative w-[800px] h-[600px] bg-white border-[16px] border-emerald-600 p-12 overflow-hidden shadow-2xl mx-auto">
      {/* Background Watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none rotate-[-30deg]">
        <div className="text-9xl font-black text-emerald-900 select-none whitespace-nowrap">
          BE FLUENT ACADEMY
        </div>
      </div>

      {/* Watermark Logo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.05] pointer-events-none">
        <Image src="/logo.png" alt="Watermark" width={400} height={400} />
      </div>

      {/* Decorative Corners */}
      <div className="absolute top-0 left-0 w-32 h-32 border-t-8 border-l-8 border-emerald-600 -translate-x-4 -translate-y-4" />
      <div className="absolute top-0 right-0 w-32 h-32 border-t-8 border-r-8 border-emerald-600 translate-x-4 -translate-y-4" />
      <div className="absolute bottom-0 left-0 w-32 h-32 border-b-8 border-l-8 border-emerald-600 -translate-x-4 translate-y-4" />
      <div className="absolute bottom-0 right-0 w-32 h-32 border-b-8 border-r-8 border-emerald-600 translate-x-4 translate-y-4" />

      {/* Header */}
      <div className="relative z-10 text-center mb-8">
        <div className="flex justify-center mb-4">
          <Image src="/logo.png" alt="Be Fluent Logo" width={120} height={120} className="object-contain" />
        </div>
        <h1 className="text-5xl font-serif text-emerald-800 tracking-widest uppercase mb-2">Certificate of Completion</h1>
        <div className="h-1 w-48 bg-emerald-600 mx-auto" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center space-y-6">
        <p className="text-xl text-gray-600 italic">This is to certify that</p>
        <h2 className="text-4xl font-bold text-gray-900 underline decoration-emerald-500 underline-offset-8">
          {studentName}
        </h2>
        <p className="text-xl text-gray-600">has successfully completed the requirements for</p>
        <div className="bg-emerald-50 py-3 px-8 inline-block rounded-full border-2 border-emerald-200">
          <span className="text-2xl font-bold text-emerald-700">English Language Level: {level}</span>
        </div>
        <p className="text-lg text-gray-500 max-w-lg mx-auto leading-relaxed">
          Demonstrating exceptional commitment, proficiency, and mastery of the English language through our advanced interactive learning curriculum.
        </p>
      </div>

      {/* Footer */}
      <div className="absolute bottom-16 left-12 right-12 flex justify-between items-end">
        <div className="text-center">
          <div className="w-48 h-[1px] bg-gray-400 mb-2" />
          <p className="font-serif text-emerald-800 font-bold">Academic Director</p>
          <p className="text-sm text-gray-500">Be Fluent Academy</p>
        </div>
        
        <div className="text-center space-y-1">
          <p className="text-xs text-gray-400 font-mono uppercase tracking-tighter">Verified ID: {certificateId}</p>
          <p className="text-sm text-emerald-700 font-bold">{date}</p>
        </div>

        <div className="text-center">
          <div className="w-48 h-[1px] bg-gray-400 mb-2" />
          <p className="font-serif text-emerald-800 font-bold">Be Fluent Seal</p>
          <div className="absolute -bottom-4 right-0 w-24 h-24 opacity-20">
            <Image src="/logo.png" alt="Seal" width={100} height={100} />
          </div>
        </div>
      </div>
    </div>
  );
}
