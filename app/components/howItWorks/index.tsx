import StepCard from './stepCard';

export default function HowItWorks() {
  return (
    <section className='container lg:flex lg:flex-col lg:flex-1 lg:justify-center'>
      <div className='mx-auto max-w-5xl text-center'>
        <h2 className='text-xl font-bold tracking-wide font-headline lg:text-2xl'>
          How It Works
        </h2>
        <p className='text-sm md:text-base mt-4'>
          Our platform uses a distributed server architecture to ensure security
          and transparency.
        </p>
      </div>
      <div className='w-full mx-auto flex flex-col gap-4 py-6 lg:flex-row lg:max-w-5xl lg:gap-12 lg:pb-4'>
        <StepCard
          stepNumber={1}
          title='Register'
          description='Create an account to participate in secure auctions.'
        />
        <StepCard
          stepNumber={2}
          title='Connect'
          description='Connect to our distributed server network for enhanced security.'
        />
        <StepCard
          stepNumber={3}
          title='Bid'
          description='Place secure bids on auctions with complete transparency.'
        />
      </div>
    </section>
  );
}
