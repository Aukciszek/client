import type { SecurityFeatureCardProps } from './interface';

export default function SecurityFeatureCard({
  Icon,
  title,
  description,
}: SecurityFeatureCardProps) {
  return (
    <div className='flex items-start gap-4 rounded-xl border border-primary-border p-6 bg-secondary shadow-sm'>
      <Icon className='size-16 flex h-min pt-1 text-teal-500 sm:pt-0 sm:size-12' />
      <div>
        <h3 className='font-bold tracking-wide font-headline lg:text-lg'>
          {title}
        </h3>
        <p className='text-sm md:text-base'>{description}</p>
      </div>
    </div>
  );
}
