'use client';

import { useState } from 'react';
import { IoMdAddCircle } from 'react-icons/io';
import { MdDelete, MdNavigateNext } from 'react-icons/md';
import { sendInitialData } from '../actions';
import { PRIME_NUMBER } from '@/app/constants';
import { getInitialValues } from './helpers';
import type { MainSettersWithStep } from '@/app/interface';
import Button from '../ui/button';

export default function ServerSetup({
  t,
  setT,
  n,
  setN,
  servers,
  setServers,
  setFirstStep,
}: MainSettersWithStep) {
  const [initialValuesServer, setInitialValuesServer] = useState<string>('');
  const [currentServer, setCurrentServer] = useState<string>('');

  const sendInitialDataWithServers = sendInitialData.bind(null, servers);

  const handleAddServer = () => {
    if (servers.length === n) {
      return;
    }
    setServers([...servers, currentServer]);
    setCurrentServer('');
  };

  const handleDelete = (server: string) => () => {
    setServers(servers.filter((s) => s !== server));
  };

  const handleGetInitialValues = () => {
    getInitialValues(setT, setN, setServers, initialValuesServer);
  };

  const handleClearData = () => {
    setT(0);
    setN(0);
    setServers([]);
    setCurrentServer('');
  };

  return (
    <>
      <form action={handleGetInitialValues} className='flex flex-col mt-12'>
        <label htmlFor='initialValuesServer' className='text-lg'>
          Enter server URL (e.g. http://localhost:5000) for downloading initial
          values:
        </label>
        <input
          type='text'
          value={initialValuesServer}
          name='initialValuesServer'
          className='mb-4 bg-sky-300 rounded-xl px-4 py-2'
          onChange={(e) => setInitialValuesServer(e.target.value)}
        />
        <Button>Get initial values</Button>
      </form>
      <form action={sendInitialDataWithServers} className='my-12'>
        <div className='w-1/2 inline-flex flex-col pr-4'>
          <label htmlFor='t' className='text-lg'>
            Enter t:
          </label>
          <input
            type='text'
            value={t}
            name='t'
            className='mb-4 bg-sky-300 rounded-xl px-4 py-2'
            onChange={(e) => setT(Number(e.target.value))}
          />
        </div>
        <div className='w-1/2 inline-flex flex-col pl-4'>
          <label htmlFor='n' className='text-lg'>
            Enter n:
          </label>
          <input
            type='text'
            value={n}
            name='n'
            className='mb-4 bg-sky-300 rounded-xl px-4 py-2'
            onChange={(e) => setN(Number(e.target.value))}
          />
        </div>
        <div className='flex items-center justify-between'>
          <label htmlFor='currentServer' className='text-lg'>
            Add server URL (e.g. http://localhost:5000)
          </label>
        </div>
        <div className='flex items-center justify-between mb-4 gap-4'>
          <input
            type='text'
            value={currentServer}
            name='currentServer'
            className='bg-sky-300 rounded-xl px-4 py-2 flex-grow'
            onChange={(e) => setCurrentServer(e.target.value)}
          />
          <button
            type='button'
            disabled={servers.length >= n}
            onClick={handleAddServer}
            className='rounded-full text-sky-300 disabled:text-gray-400 disabled:opacity-50 w-12 h-12'
          >
            <IoMdAddCircle className='rounded-full w-full h-full' />
          </button>
        </div>
        <Button>Submit</Button>
        <Button callback={handleClearData}>Clear data</Button>
        <div>
          <h2 className='mt-4'>Prime number (p): {PRIME_NUMBER}</h2>
          <h2>Servers:</h2>
          <ul className='flex flex-col gap-2'>
            {servers.map((server) => (
              <li
                key={server}
                className='flex justify-between items-center px-2 py-1 rounded-xl bg-sky-300 transition-all animate-fade-in'
              >
                {server}
                <MdDelete
                  onClick={handleDelete(server)}
                  className='text-lg cursor-pointer'
                />
              </li>
            ))}
          </ul>
        </div>
      </form>
      <button
        type='button'
        onClick={() => setFirstStep(false)}
        className='fixed right-12 bottom-12 p-2 text-3xl bg-sky-950 text-slate-50 rounded-full'
      >
        <MdNavigateNext />
      </button>
    </>
  );
}
