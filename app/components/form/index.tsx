'use client';

import type { FormFieldProps } from './interface';

export default function Form({ children, onSubmit }: FormFieldProps) {
  return (
    <form
      className='flex flex-col gap-4 p-4 border border-primary-border bg-secondary rounded-xl shadow-sm'
      onSubmit={onSubmit}
    >
      {children}
    </form>
  );
}
