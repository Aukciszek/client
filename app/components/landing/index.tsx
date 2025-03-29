import Link from 'next/link';
import { FaShieldAlt } from 'react-icons/fa';
import { LuServer } from 'react-icons/lu';
import { LiaLockSolid } from 'react-icons/lia';
import Button from '../ui/button';
import SecurityFeatureCard from '../ui/securityFeatureCard';

export default function Landing() {
  return (
    <section className='container flex pt-4 pb-8 flex-col gap-6 lg:flex-row lg:py-12 lg:gap-12'>
      <div className='basis-1/2 space-y-4 lg:pr-12'>
        <h1 className='text-2xl font-bold tracking-wide font-headline sm:text-3xl md:text-4xl lg:text-5xl'>
          Secure Auctions Platform
        </h1>
        <p className='text-sm md:text-base xl:text-lg'>
          A trusted platform for conducting secure and transparent auctions with
          distributed server architecture.
        </p>
        <div className='w-full flex justify-between sm:justify-start sm:gap-4'>
          <Link href='/sign-up'>
            <Button variant='default'>Get Started</Button>
          </Link>
          <Link href='/about'>
            <Button variant='outline'>Learn More</Button>
          </Link>
        </div>
      </div>
      <div className='basis-1/2 flex items-center justify-center'>
        <div className='flex flex-col gap-4 w-full'>
          <SecurityFeatureCard
            Icon={FaShieldAlt}
            title='Advanced Security'
            description='End-to-end encryption and secure authentication protocols protect your data and transactions.'
          />
          <SecurityFeatureCard
            Icon={LuServer}
            title='Distributed Architecture'
            description='Our multi-server approach ensures reliability and prevents single points of failure.'
          />
          <SecurityFeatureCard
            Icon={LiaLockSolid}
            title='Reliable Bidding'
            description='All bids are securely logged and verified across multiple servers for complete transparency.'
          />
        </div>
      </div>
    </section>
  );
}
