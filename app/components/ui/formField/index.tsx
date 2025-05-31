'use client';

import { type ChangeEvent } from 'react';
import Input from '@/app/components/ui/input';
import Label from '@/app/components/ui/label';
import type { FormFieldProps } from './interface';

export default function formField({
  id,
  text,
  value,
  setValue,
  placeholder,
  type,
  disabled = false,
  minValue,
  maxValue,
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
          if (e.target.value === '') {
            setValue('');
            return;
          }
          if (type !== 'number') {
            setValue(e.target.value);
            return;
          }
          if (minValue && maxValue) {
            if (Number(e.target.value) < minValue) {
              setValue(minValue.toString());
              return;
            }
            if (Number(e.target.value) > maxValue) {
              setValue(maxValue.toString());
              return;
            }
          }
          setValue(e.target.value.trim());
        }}
        required
        disabled={disabled}
        min={minValue}
        max={maxValue}
      />
    </div>
  );
}
