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
  disabled = false,
}: FormFieldProps) {
  return (
    <div className='w-full flex flex-col gap-2'>
      <Label htmlFor={id}>{text}</Label>

      <Input
        id={id}
        name={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          if (setValue === undefined) return;
          setValue(e.target.value.trim());
        }}
        required
        disabled={disabled}
      />
    </div>
  );
}
