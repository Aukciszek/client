'use client';

import Link from 'next/link';
import Button from '@/app/components/ui/button';
import type { FormActionsProps } from './interface';

export default function FormActions({
  isLoading,
  isSignUp,
  isSignIn,
}: FormActionsProps) {
  return (
    <div className='flex flex-col'>
      <Button variant='default' type='submit' disabled={isLoading}>
        {isSignUp && (isLoading ? 'Signing up...' : 'Sign up')}
        {isSignIn && (isLoading ? 'Signing in...' : 'Sign in')}
      </Button>
      <p className='mt-4 text-center text-sm'>
        {isSignUp && 'Already have an account?'}
        {isSignIn && "Don't have an account?"}
        <Link
          href={isSignUp ? '/sign-in' : '/sign-up'}
          className='underline text-teal-700 ml-1'
        >
          {isSignUp && 'Sign in'}
          {isSignIn && 'Sign up'}
        </Link>
      </p>
    </div>
  );
}
