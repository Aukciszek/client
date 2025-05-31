'use client';

import Link from 'next/link';
import Button from '@/app/components/ui/button';
import { IoIosHome } from 'react-icons/io';

export default function BackLink() {
  return (
    <Link href='/' className='absolute left-4 top-4 md:left-8 md:top-8'>
      <Button variant='ghost' style='flex items-center gap-2'>
        <IoIosHome /> Home
      </Button>
    </Link>
  );
}
