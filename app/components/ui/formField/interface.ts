import type { Dispatch, SetStateAction } from 'react';

export interface FormFieldProps {
  id: string;
  text: string;
  value: string;
  setValue?: Dispatch<SetStateAction<string>>;
  placeholder?: string;
  type: string;
  disabled?: boolean;
  minValue?: number;
  maxValue?: number;
}
