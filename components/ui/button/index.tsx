import type { ReactNode, MouseEvent } from 'react';

export interface ButtonProps {
  callback?:
    | (() => void)
    // eslint-disable-next-line no-unused-vars
    | ((e: MouseEvent<HTMLButtonElement>) => Promise<void>);
  children: ReactNode;
}

export default function SecondStep({ callback, children }: ButtonProps) {
  return (
    <button
      onClick={callback ? (e) => callback(e) : undefined}
      className='w-full bg-sky-950 p-2 text-slate-50 rounded-full mb-8'
    >
      {children}
    </button>
  );
}
