import type { FormEvent } from 'react';

export interface FormFieldProps {
  children: React.ReactNode;
  // eslint-disable-next-line no-unused-vars
  onSubmit: (e: FormEvent) => Promise<void>;
}
