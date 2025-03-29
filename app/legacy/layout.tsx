import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

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
export default function SubLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body
        className={`flex flex-col ${geistSans.variable} ${geistMono.variable} font-mono bg-slate-50 antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
