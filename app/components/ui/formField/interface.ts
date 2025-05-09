import type { Dispatch, SetStateAction } from 'react';

export interface FormFieldProps {
  id: string;
  text: string;
  value: string;
  setValue?: Dispatch<SetStateAction<string>>;
  placeholder?: string;
  type: string;
  forgotPassowrd?: boolean;
  disabled?: boolean;
}
