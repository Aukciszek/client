'use client';

import { useState } from 'react';
import ServerSetup from '../components/serverSetup';
import SecondStep from '../components/secondStep';
import Navbar from '@/components/ui/navbar';
import { ToastContainer } from 'react-toastify';

export default function Home() {
  const [t, setT] = useState<number>(0);
  const [n, setN] = useState<number>(0);
  const [servers, setServers] = useState<string[]>([]);
  const [firstStep, setFirstStep] = useState<boolean>(true);

  return (
    <>
      <Navbar servers={servers} />
      <div className='w-full h-full flex flex-col items-center justify-center'>
        <div className='w-1/2'>
          {firstStep ? (
            <ServerSetup
              t={t}
              setT={setT}
              n={n}
              setN={setN}
              servers={servers}
              setServers={setServers}
              setFirstStep={setFirstStep}
            />
          ) : (
            <SecondStep
              t={t}
              n={n}
              servers={servers}
              setFirstStep={setFirstStep}
            />
          )}
        </div>
      </div>
      <ToastContainer />
    </>
  );
}
