import type { StepCardProps } from './interface';

export default function StepCard({
  stepNumber,
  title,
  description,
}: StepCardProps) {
  return (
    <div className='basis-1/3 flex flex-col items-center space-y-2 rounded-xl border border-primary-border bg-secondary p-4 shadow-sm'>
      <div className='h-10 w-10 flex justify-center items-center rounded-full text-sm bg-teal-500 text-secondary lg:text-base'>
        {stepNumber}
      </div>
      <h3 className='text-lg font-bold tracking-wide font-headline'>{title}</h3>
      <p className='text-sm text-center lg:text-base'>{description}</p>
    </div>
  );
}
