import { IoIosUndo } from 'react-icons/io';
import { IoArrowUndoCircleSharp } from 'react-icons/io5';
import { hardReset, reset } from './actions';
import type { NavbarProps } from './interface';

export default function Navbar({ servers }: NavbarProps) {
  return (
    <header className='relative flex justify-between items-center p-4 bg-sky-300 text-neutral-950'>
      <h1 className='text-3xl flex-grow text-center'>AUKCISZEK</h1>
      <ul className='fixed right-4 flex gap-4'>
        <li>
          <button
            onClick={() => reset(servers)}
            className='size-10 rounded-full'
          >
            <IoIosUndo className='w-full h-full rounded-full' />
          </button>
        </li>
        <li>
          <button
            onClick={() => hardReset(servers)}
            className='size-10 rounded-full'
          >
            <IoArrowUndoCircleSharp className='w-full h-full rounded-full' />
          </button>
        </li>
      </ul>
    </header>
  );
}
