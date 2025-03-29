'use client';

import type { MainPropsWithStep } from '@/app/interface';
import {
  handleMultiplication as handleMultiplication,
  handleShamir,
} from './helpers';
import Button from '../button';
import { MdNavigateBefore } from 'react-icons/md';

export default function SecondStep({
  t,
  n,
  id,
  secret,
  reconstructedSecret,
  firstClientId,
  secondClientId,
  isSecretReconstructed,
  servers,
  setId,
  setSecret,
  setReconstructedSecret,
  setFirstClientId,
  setSecondClientId,
  setIsSecretReconstructed,
  setFirstStep,
}: MainPropsWithStep) {
  const handleShamirClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    await handleShamir(secret, id, t, n, servers);
  };

  const handleMutiplicationClick = async () => {
    const secrets = await handleMultiplication(
      firstClientId,
      secondClientId,
      servers,
    );
    setIsSecretReconstructed(true);
    setReconstructedSecret(secrets);
  };

  const handleClearData = () => {
    setId(0);
    setSecret(0);
    setReconstructedSecret([]);
    setFirstClientId(0);
    setSecondClientId(0);
    setIsSecretReconstructed(false);
  };

  return (
    <>
      <div className='mt-8'>
        <div className='w-1/2 inline-flex flex-col pr-4'>
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
        </div>
        <div className='w-1/2 inline-flex flex-col pl-4'>
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
        </div>

        <Button callback={handleShamirClick}>Generate Shamir</Button>
      </div>
      <div className='mt-8'>
        <div className='w-1/2 inline-flex flex-col pr-4'>
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
        </div>
        <div className='w-1/2 inline-flex flex-col pl-4'>
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
        <Button callback={handleClearData}>Clear data</Button>
      </div>
      <Button callback={handleMutiplicationClick}>Reconstruct Secret</Button>
      {isSecretReconstructed && (
        <ul className='flex flex-col gap-2 mb-12'>
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
        className='fixed right-12 bottom-12 p-2 text-3xl bg-sky-950 text-secondary rounded-full'
      >
        <MdNavigateBefore />
      </button>
    </>
  );
}
