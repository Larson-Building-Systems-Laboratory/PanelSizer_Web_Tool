import type { Metadata } from 'next';
import { Work_Sans } from 'next/font/google';
import { RevealObserver } from '@/components/RevealObserver';
import './globals.css';

// Work Sans is the BEST Center typeface (best-iucrc.org)
const workSans = Work_Sans({
  variable: '--font-work-sans',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Panel Sizer',
  description: 'NEC Residential Service Entrance Calculator',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${workSans.variable} min-h-screen font-sans antialiased`}>
        <RevealObserver />
        {children}
      </body>
    </html>
  );
}
