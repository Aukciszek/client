'use client';

import Link from 'next/link';
import Button from '../ui/button';
import type { NavbarProps } from './interface';
import { useRouter } from 'next/navigation';

export default function Navbar({ isLogged }: NavbarProps) {
  const router = useRouter();

  const handleLogout = () => {
    router.push('/sign-in');
  };

  return (
    <header className='container flex h-16 items-center justify-between'>
      <h1 className='text-lg font-bold tracking-wide font-headline lg:text-xl'>
        Aukciszek
      </h1>
      <nav className='flex gap-2 lg:gap-4'>
        {isLogged ? (
          <Button variant='default' onClick={handleLogout}>
            Logout
          </Button>
        ) : (
          <>
            <Link href='/sign-in'>
              <Button variant='ghost'>Login</Button>
            </Link>
            <Link href='/sign-up'>
              <Button variant='default'>Sign Up</Button>
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
