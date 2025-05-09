'use client';

import { hardReset, reset } from './actions';
import type { NavbarProps } from './interface';

export default function Navbar({
  servers,
  setFirstStep,
  setAllowNavigation,
  handleClearDataFirstStep,
  handleClearDataSecondStep,
}: NavbarProps) {
  return (
    <>
      <header className='w-full relative flex justify-between items-center p-4 bg-sky-300 text-neutral-950'>
        <h1 className='text-3xl grow text-center'>AUKCISZEK</h1>
        <ul className='absolute right-4 flex gap-4'>
          <li>
            <button
              onClick={() => reset(servers, handleClearDataSecondStep)}
              className='w-full bg-sky-950 p-2 text-secondary rounded-full px-4'
            >
              RESET SERVERS
            </button>
          </li>
          <li>
            <button
              onClick={() =>
                hardReset(
                  servers,
                  setFirstStep,
                  setAllowNavigation,
                  handleClearDataFirstStep,
                  handleClearDataSecondStep,
                )
              }
              className='w-full bg-sky-950 p-2 text-secondary rounded-full px-4'
            >
              FACTORY RESET SERVERS
            </button>
          </li>
        </ul>
      </header>
    </>
  );
}
