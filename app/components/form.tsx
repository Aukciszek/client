'use client';

import { useState } from 'react';
import { PRIME_NUMBER } from '../constants';
import { IoMdAddCircle } from 'react-icons/io';
import { MdDelete } from 'react-icons/md';
import { sendInitialData } from './actions';
import { shamir } from './helpers';

export default function Form() {
  const [t, setT] = useState<number>(0);
  const [n, setN] = useState<number>(0);
  const [id, setId] = useState<number>(0);
  const [secret, setSecret] = useState<number>(0);
  const [reconstructedSecret, setReconstructedSecret] = useState<number>(0);
  const [firstClientId, setFirstClientId] = useState<number>(0);
  const [secondClientId, setSecondClientId] = useState<number>(0);
  const [currentServer, setCurrentServer] = useState<string>('');
  const [servers, setServers] = useState<string[]>([]);
  const [initialValues, setInitialValues] = useState<string[]>([]);

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

  const handleGetInitialValues = async () => {
    await fetch('localhost:5000/api/initial-values')
      .then((res) => res.json())
      .then((data) => {
        setT(data.t);
        setN(data.n);
        setInitialValues(data.parties);
      });
  };

  const handleShamir = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    // eslint-disable-next-line no-unused-vars
    const [shares, p] = shamir(t, n, BigInt(secret));

    const promises = servers.entries().map(
      ([i, server]) =>
        new Promise((resolve) => {
          fetch(`${server}/api/set-shares`, {
            method: 'POST',
            headers: {
              'content-type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify({
              client_id: id,
              share: Number(shares[i][1]),
            }),
          }).then((res) => {
            resolve(res.body);
          });
        }),
    );
    await Promise.all(promises);
  };

  const handleCalculateR = async () => {
    const promises = servers.map(
      (server) =>
        new Promise((resolve) => {
          fetch(`${server}/api/calculate-r`, {
            method: 'POST',
            headers: {
              'content-type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify({
              first_client_id: firstClientId,
              second_client_id: secondClientId,
            }),
          }).then((res) => {
            resolve(res.body);
          });
        }),
    );
    await Promise.all(promises);
  };

  const handleSendRToOtherParties = async () => {
    const promises = servers.map(
      (server) =>
        new Promise((resolve) => {
          fetch(`${server}/api/send-r-to-parties`, {
            method: 'PUT',
            headers: {
              'content-type': 'application/json',
              Accept: 'application/json',
            },
          }).then((res) => {
            resolve(res.body);
          });
        }),
    );
    await Promise.all(promises);
  };

  const handleCalculateMultiplicativeShare = async () => {
    const promises = servers.map(
      (server) =>
        new Promise((resolve) => {
          fetch(`${server}/api/calculate-multiplicative-share`, {
            method: 'PUT',
            headers: {
              'content-type': 'application/json',
              Accept: 'application/json',
            },
          }).then((res) => {
            resolve(res.body);
          });
        }),
    );
    await Promise.all(promises);
  };

  const handleReconstructSecret = async () => {
    const promises = servers.map(
      (server) =>
        new Promise((resolve) => {
          fetch(`${server}/api/reconstruct-secret`, {
            method: 'GET',
            headers: {
              'content-type': 'application/json',
              Accept: 'application/json',
            },
          }).then((res) => {
            res.json().then((data) => {
              console.log(data); // Logs the actual parsed JSON data
              resolve(data); // Resolve with the parsed JSON data if needed
            });
          });
        }),
    );
    await Promise.all(promises);
  };

  return (
    <div className='w-72'>
      <form action={sendInitialDataWithServers} className='flex flex-col mt-12'>
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
        <div className='flex items-center justify-between'>
          <label htmlFor='currentServer' className='text-lg'>
            Add server address:
          </label>
        </div>
        <div className='flex items-center justify-between mb-4 gap-4'>
          <input
            type='text'
            value={currentServer}
            name='currentServer'
            className='bg-sky-300 rounded-xl px-4 py-2'
            onChange={(e) => setCurrentServer(e.target.value)}
          />
          <button
            type='button'
            disabled={servers.length >= n}
            onClick={handleAddServer}
            className='rounded-full w-full h-full text-sky-300 disabled:text-gray-400 disabled:opacity-50'
          >
            <IoMdAddCircle className='rounded-full w-full h-full' />
          </button>
        </div>
        <button className='w-full bg-sky-950 p-2 text-slate-50 rounded-full'>
          Submit
        </button>
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
      <div className='mt-8'>
        <button
          onClick={handleGetInitialValues}
          className='w-full bg-sky-950 p-2 text-slate-50 rounded-full'
        >
          Get initial values
        </button>
        <h2 className='mt-4'>Initial values:</h2>
        <ul className='flex flex-col gap-2'>
          {initialValues.map((value) => (
            <li
              key={value}
              className='flex justify-between items-center px-2 py-1 rounded-xl bg-sky-300 transition-all animate-fade-in'
            >
              {value}
            </li>
          ))}
        </ul>
      </div>
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
        <button
          onClick={handleShamir}
          className='w-full bg-sky-950 p-2 text-slate-50 rounded-full'
        >
          Do shamir
        </button>
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
      <button
        onClick={handleCalculateR}
        className='w-full bg-sky-950 p-2 text-slate-50 rounded-full mb-8'
      >
        Calculate r
      </button>
      <button
        onClick={handleSendRToOtherParties}
        className='w-full bg-sky-950 p-2 text-slate-50 rounded-full mb-8'
      >
        Send r to other parties
      </button>
      <button
        onClick={handleCalculateMultiplicativeShare}
        className='w-full bg-sky-950 p-2 text-slate-50 rounded-full mb-8'
      >
        Calculate Multiplicative Share
      </button>
      <button
        onClick={handleReconstructSecret}
        className='w-full bg-sky-950 p-2 text-slate-50 rounded-full mb-8'
      >
        Reconstruct Secret
      </button>
    </div>
  );
}
