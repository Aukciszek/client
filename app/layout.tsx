import type { Metadata } from 'next';
import { Roboto, Arvo } from 'next/font/google';
import './globals.css';

const roboto = Roboto({
  variable: '--font-default',
  subsets: ['latin'],
  display: 'swap',
  weight: '400',
});

const arvo = Arvo({
  variable: '--font-arvo',
  subsets: ['latin'],
  display: 'swap',
  weight: '400',
});

export const metadata: Metadata = {
  title: 'Aukciszek',
  description: 'Anonymous reverse auctions',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body
        className={`flex flex-col items-center justify-center ${roboto.variable} ${arvo.variable} font-default bg-primary text-gray-950 min-h-screen antialiased px-4 scroll-none`}
      >
        {children}
      </body>
    </html>
  );
}
