'use client';

import type { FormInfoProps } from './interface';

export default function FormInfo({
  isSignUp,
  isSignIn,
}: FormInfoProps) {
  return (
    <div className='flex flex-col space-y-2 text-center'>
      <h1 className='text-2xl font-semibold tracking-tight font-headline'>
        {isSignUp && 'Create an account'}
        {isSignIn && 'Login'}
      </h1>
      <p className='text-sm'>
        {isSignUp && 'Enter your information to create an account'}
        {isSignIn && 'Enter your credentials to access your account'}
      </p>
    </div>
  );
}
