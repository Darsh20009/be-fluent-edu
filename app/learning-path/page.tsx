"use client";

import React from 'react';
import LearningPathMap from '@/components/learning-path/LearningPathMap';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function LearningPathPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-5xl font-black text-gray-900 mb-4">خريطة التعلم الذكية</h1>
        <p className="text-xl text-gray-600">طريقك نحو الإتقان خطوة بخطوة مع Be Fluent</p>
      </div>
      <LearningPathMap />
      <Footer />
    </main>
  );
}