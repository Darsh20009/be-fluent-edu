import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { ThemeProvider } from "@/lib/contexts/ThemeContext";
import SessionProvider from "@/lib/providers/SessionProvider";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import BFAuthExperience from "@/components/auth/BFAuthExperience";
import { Toaster } from "react-hot-toast";
import { defaultMetadata, organizationJsonLd, courseJsonLd, faqJsonLd, websiteJsonLd } from "@/lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = defaultMetadata;

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#24714f',
  colorScheme: 'light dark',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const initialLanguage = cookieStore.get('language')?.value === 'en' ? 'en' : 'ar';
  return (
    <html lang={initialLanguage} dir={initialLanguage === 'ar' ? 'rtl' : 'ltr'} suppressHydrationWarning>
      <head>
        {/* Preload critical assets immediately */}
        <link rel="icon" type="image/png" sizes="32x32" href="/brand/be-fluent-icon-2026-32.png" />
        <link rel="icon" type="image/png" sizes="48x48" href="/brand/be-fluent-icon-2026-48.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/brand/be-fluent-apple-2026.png" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Be Fluent" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#24714f" />
        <meta name="msapplication-TileImage" content="/brand/be-fluent-icon-2026-144.png" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
        <Script
          id="organization-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <Script
          id="course-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd) }}
        />
        <Script
          id="faq-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
        <Script
          id="website-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <ServiceWorkerRegister />
        <SessionProvider>
          <ThemeProvider initialLanguage={initialLanguage}>
            <Toaster
              position="top-center"
              toastOptions={{
                duration: 3000,
                style: {
                  fontFamily: 'inherit',
                  direction: 'inherit',
                  textAlign: 'start',
                },
                success: {
                  style: {
                    background: '#f0fdf4',
                    color: '#166534',
                    border: '1px solid #bbf7d0',
                  },
                },
                error: {
                  style: {
                    background: '#fef2f2',
                    color: '#991b1b',
                    border: '1px solid #fecaca',
                  },
                },
              }}
            />
            <BFAuthExperience />
            {children}
            <PWAInstallPrompt />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
