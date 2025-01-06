import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
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
        className={`${geistSans.variable} ${geistMono.variable} font-mono bg-slate-50 antialiased`}
      >
        <header className='flex justify-center p-4 bg-sky-300 text-neutral-950'>
          <h1 className='text-3xl'>{metadata.title as string}</h1>
        </header>
        {children}
      </body>
    </html>
  );
}
