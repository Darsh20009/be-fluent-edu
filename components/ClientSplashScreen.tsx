'use client';

import dynamic from 'next/dynamic';

const SplashScreen = dynamic(() => import('./SplashScreen'), {
  ssr: false,
});

export default function ClientSplashScreen() {
  return <SplashScreen />;
}
