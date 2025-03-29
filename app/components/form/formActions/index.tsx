'use client';

import Link from 'next/link';
import Button from '@/app/components/ui/button';
import type { FormActionsProps } from './interface';

export default function FormActions({
  isLoading,
  isSignUp,
  isSignIn,
  forgotPassowrd,
}: FormActionsProps) {
  return (
    <div className='flex flex-col'>
      <Button variant='default' type='submit' disabled={isLoading}>
        {isSignUp && (isLoading ? 'Signing up...' : 'Sign up')}
        {isSignIn && (isLoading ? 'Signing in...' : 'Sign in')}
        {forgotPassowrd && (isLoading ? 'Reseting password' : 'Reset password')}
      </Button>
      <p className='mt-4 text-center text-sm'>
        {isSignUp && 'Already have an account?'}
        {isSignIn && "Don't have an account?"}
        {forgotPassowrd && 'Remember your password?'}
        <Link
          href={isSignUp || forgotPassowrd ? '/sign-in' : '/sign-up'}
          className='underline text-teal-700 ml-1'
        >
          {isSignUp && 'Sign in'}
          {isSignIn && 'Sign up'}
          {forgotPassowrd && 'Sign in'}
        </Link>
      </p>
    </div>
  );
}
