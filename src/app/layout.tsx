
import type {Metadata} from 'next';
import {PT_Sans, Playfair_Display} from 'next/font/google';
import './globals.css';
import {cn} from '@/lib/utils';
import {Toaster} from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase';

const ptSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-sans',
});

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  variable: '--font-serif',
});

export const metadata: Metadata = {
  title: 'BULLIONS BOT | AI-Powered Gold Trading Signals',
  description: 'Leverage our advanced AI to get real-time, high-accuracy XAU/USD trading signals. Stop trading on emotion, start trading on data. 80%+ Accuracy.',
  keywords: 'gold trading signals, xauusd signals, ai trading bot, gold trading, forex signals',
  icons: {
    icon: '/icon.png',
  },
  other: {
    "monetag": "fda6d9cec0ebfe51f58c6a43be1b264b"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          ptSans.variable,
          playfairDisplay.variable
        )}
      >
        <FirebaseClientProvider>
          {children}
        </FirebaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
