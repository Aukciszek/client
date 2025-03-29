import HowItWorks from './components/howItWorks';
import Navbar from './components/navbar';
import Footer from './components/footer';
import Landing from './components/landing';

export default function Home() {
  return (
    <>
      <Navbar />
      <main className='flex flex-col items-center justify-between'>
        <Landing />
        <HowItWorks />
      </main>
      <Footer />
    </>
  );
}
