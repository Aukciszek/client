import { type InputHTMLAttributes } from 'react';

type CustomInputProps = InputHTMLAttributes<HTMLInputElement> & {
  style?: string;
};

export default function Input({ style, ...props }: CustomInputProps) {
  return (
    <input
      className={`w-full px-3 py-1.5 text-sm rounded-xl bg-primary border border-primary-border lg:px-4 lg:py-2 lg:text-base ${style}`}
      {...props}
    />
  );
}
