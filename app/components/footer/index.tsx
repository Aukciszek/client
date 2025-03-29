import Link from 'next/link';

export default function Footer() {
  return (
    <footer className='container flex flex-col items-center justify-between gap-4 py-6 md:py-0 md:h-16 md:flex-row'>
      <p className='text-sm'>© 2025 Aukciszek. All rights reserved.</p>
      <nav className='flex gap-4 text-sm'>
        <Link href='/terms' className='underline underline-offset-4'>
          Terms
        </Link>
        <Link href='/privacy' className='underline underline-offset-4'>
          Privacy
        </Link>
      </nav>
    </footer>
  );
}
