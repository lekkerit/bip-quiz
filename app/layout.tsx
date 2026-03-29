import type { Metadata } from 'next';
import { Space_Grotesk, DM_Mono } from 'next/font/google';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  weight: ['400', '500', '600', '700'],
});

const dmMono = DM_Mono({
  subsets: ['latin'],
  variable: '--font-dm-mono',
  weight: ['400', '500'],
});

export const metadata: Metadata = {
  title: 'What level Claude user are you? — Bots in Public',
  description: 'Most Claude Pro subscribers are stuck at Level 2. Six questions. Find out where you actually are.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${dmMono.variable}`}>
      <head />
      <body style={{
        margin: 0,
        padding: 0,
        background: '#0a0f1a',
        fontFamily: 'var(--font-space-grotesk), sans-serif',
        color: '#c8d8e8',
        minHeight: '100vh',
      }}>
        {children}
      </body>
    </html>
  );
}
