import { type ButtonHTMLAttributes } from 'react';

type CustomButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant: 'ghost' | 'outline' | 'default';
  style?: string;
};

export default function CustomButton({
  variant,
  style,
  ...props
}: CustomButtonProps) {
  return (
    <button
      className={`padding px-3 py-1.5 rounded-xl cursor-pointer transition-all text-sm ${props.disabled && 'disabled:opacity-60 disabled:cursor-not-allowed'} ${
        variant === 'ghost'
          ? 'hover:bg-teal-100'
          : variant === 'outline'
            ? 'border border-teal-500 text-teal-500 transition-all hover:bg-secondary'
            : 'text-secondary bg-teal-500 transition-all hover:bg-teal-400 disabled:hover:bg-teal-500'
      } ${style} lg:text-base lg:px-4 lg:py-2`}
      {...props}
    >
      {props.children}
    </button>
  );
}
