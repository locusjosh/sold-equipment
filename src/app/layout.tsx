import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Nav } from '@/components/Nav';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Sold Equipment',
  description: 'Smart sold-equipment pipeline + warehouse board (replaces EQUIP SOLD Zap)',
  manifest: '/sold-equipment/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Sold Equipment',
  },
  icons: {
    apple: '/sold-equipment/apple-touch-icon.png',
    icon: [
      { url: '/sold-equipment/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/sold-equipment/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: '#09090b',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

const BASE = '/sold-equipment';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Nav />
        <main className="app-main mx-auto max-w-6xl px-4 py-5">{children}</main>
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator){navigator.serviceWorker.register('${BASE}/sw.js').catch(()=>{});}`,
          }}
        />
      </body>
    </html>
  );
}
