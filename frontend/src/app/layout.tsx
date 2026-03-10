import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Panel Sizer',
  description: 'NEC Residential Service Entrance Calculator',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-bg text-text font-sans text-[15px] leading-relaxed min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
