'use client';

import { type ChangeEvent } from 'react';
import Input from '@/app/components/ui/input';
import Label from '@/app/components/ui/label';
import type { FormFieldProps } from './interface';
import Link from 'next/link';

export default function formField({
  id,
  text,
  value,
  setValue,
  placeholder,
  type,
  forgotPassowrd,
}: FormFieldProps) {
  return (
    <div className='w-full flex flex-col gap-2'>
      {forgotPassowrd ? (
        <div className='flex items-center justify-between'>
          <Label htmlFor='password'>Password</Label>
          <Link href='/forgot-password' className='text-xs underline'>
            Forgot password?
          </Link>
        </div>
      ) : (
        <Label htmlFor={id}>{text}</Label>
      )}
      <Input
        id={id}
        name={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setValue(e.target.value.trim())
        }
        required
      />
    </div>
  );
}
