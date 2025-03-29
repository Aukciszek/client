'use client';

import BackLink from '@/app/components/ui/backLink';
import type { AuthFormWrapperProps } from './interface';

export default function AuthFormWrapper({ children }: AuthFormWrapperProps) {
  return (
    <div className='container h-full flex flex-col items-center justify-center'>
      <BackLink />
      <div className='w-full mx-auto flex flex-col justify-center space-y-6 sm:w-[350px]'>
        {children}
      </div>
    </div>
  );
}
