import { type LabelHTMLAttributes } from 'react';

export default function Label(props: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className='text-sm lg:text-base' {...props}>
      {props.children}
    </label>
  );
}
