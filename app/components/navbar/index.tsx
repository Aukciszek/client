'use client';

import Link from 'next/link';
import Button from '../ui/button';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { toast } from 'react-toastify';
import type { NavbarProps } from './interface';

export default function Navbar({ isLogged }: NavbarProps) {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    router.push('/sign-in');
  };

  const displayName = user?.uid || '';

  return (
    <header className='container flex h-16 items-center justify-between'>
      <h1 className='text-lg font-bold tracking-wide font-headline lg:text-xl'>
        <Link href='/'>Aukciszek</Link>
      </h1>
      <nav className='flex gap-2 lg:gap-4 items-center'>
        {isLogged || isAuthenticated ? (
          <>
            <span className='text-sm hidden md:block'>
              Hello, {displayName}
            </span>
            <Button variant='default' onClick={handleLogout}>
              Logout
            </Button>
          </>
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
