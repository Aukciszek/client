'use client';

import type { MainPropsWithStep } from '@/app/interface';
import { useState } from 'react';
import {
  handleCalculateMultiplicativeShare,
  handleCalculateQAndRAndRedistribute,
  handleReconstructSecret,
  handleShamir,
} from './helpers';
import Button from '../ui/button';
import { MdNavigateBefore } from 'react-icons/md';

export default function SecondStep({
  t,
  n,
  servers,
  setFirstStep,
}: MainPropsWithStep) {
  const [id, setId] = useState<number>(0);
  const [secret, setSecret] = useState<number>(0);
  const [reconstructedSecret, setReconstructedSecret] = useState<
    [string, number][]
  >([]);
  const [firstClientId, setFirstClientId] = useState<number>(0);
  const [secondClientId, setSecondClientId] = useState<number>(0);
  const [
    isRAndQCalculatedAndRedistributed,
    seItsRAndQCalculatedAndRedistributed,
  ] = useState<boolean>(false);
  const [isMultiplicativeShareCalculated, setIsMultiplicativeShareCalculated] =
    useState<boolean>(false);
  const [isSecretReconstructed, setIsSecretReconstructed] =
    useState<boolean>(false);

  const handleShamirClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    await handleShamir(secret, id, t, n, servers);
  };

  const handleCalculateQAndRAndRedistributeClick = async () => {
    await handleCalculateQAndRAndRedistribute(
      firstClientId,
      secondClientId,
      servers,
    );
    seItsRAndQCalculatedAndRedistributed(true);
  };

  const handleCalculateMultiplicativeShareClick = async () => {
    await handleCalculateMultiplicativeShare(servers);
    setIsMultiplicativeShareCalculated(true);
  };

  const handleReconstructSecretClick = async () => {
    const secrets = await handleReconstructSecret(servers);
    setIsSecretReconstructed(true);
    setReconstructedSecret(secrets);
  };

  return (
    <>
      <div className='mt-8 flex flex-col'>
        <label htmlFor='id' className='text-lg'>
          Enter id:
        </label>
        <input
          type='text'
          value={id}
          name='id'
          className='mb-4 bg-sky-300 rounded-xl px-4 py-2'
          onChange={(e) => setId(Number(e.target.value))}
        />
        <label htmlFor='secret' className='text-lg'>
          Enter secret:
        </label>
        <input
          type='text'
          value={secret}
          name='secret'
          className='mb-4 bg-sky-300 rounded-xl px-4 py-2'
          onChange={(e) => setSecret(Number(e.target.value))}
        />
        <Button callback={handleShamirClick}>Generate Shamir</Button>
      </div>
      <div className='mt-8 flex flex-col'>
        <label htmlFor='firstClientId' className='text-lg'>
          Enter first client id for multiplication:
        </label>
        <input
          type='text'
          value={firstClientId}
          name='firstClientId'
          className='mb-4 bg-sky-300 rounded-xl px-4 py-2'
          onChange={(e) => setFirstClientId(Number(e.target.value))}
        />
        <label htmlFor='secondClientId' className='text-lg'>
          Enter second client id for multiplication:
        </label>
        <input
          type='text'
          value={secondClientId}
          name='secondClientId'
          className='mb-4 bg-sky-300 rounded-xl px-4 py-2'
          onChange={(e) => setSecondClientId(Number(e.target.value))}
        />
      </div>
      <Button callback={handleCalculateQAndRAndRedistributeClick}>
        Calculate q and r and redistribute
      </Button>
      {isRAndQCalculatedAndRedistributed && (
        <Button callback={handleCalculateMultiplicativeShareClick}>
          Calculate Multiplicative Share
        </Button>
      )}
      {isMultiplicativeShareCalculated && (
        <Button callback={handleReconstructSecretClick}>
          Reconstruct Secret
        </Button>
      )}
      {isSecretReconstructed && (
        <ul className='flex flex-col gap-2'>
          {reconstructedSecret.map(([server, secret]) => (
            <li
              key={server}
              className='flex justify-between items-center px-2 py-1 rounded-xl bg-sky-300 transition-all animate-fade-in'
            >
              {server}: {secret}
            </li>
          ))}
        </ul>
      )}
      <button
        type='button'
        onClick={() => setFirstStep(true)}
        className='fixed right-12 bottom-12 p-2 text-3xl bg-sky-950 text-slate-50 rounded-full'
      >
        <MdNavigateBefore />
      </button>
    </>
  );
}
