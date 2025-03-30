'use client';

import { useState } from 'react';
import Button from '../components/ui/button';
import Footer from '../components/footer';
import { LuServer } from 'react-icons/lu';
import { IoMdRefresh, IoMdSend } from 'react-icons/io';
import Navbar from '../components/navbar';
import FormField from '../components/ui/formField';
import ServerStatus from '../components/ui/serverStatus';
import { getServerAddresses } from '../globalHelpers';
import type { Server } from '../globalInterface';
import { MdOutlineInfo } from 'react-icons/md';
import { getInitialValues, handleShamir } from './helpers';
import { handleMultiplication } from '../legacy/secondStep/helpers';

export default function ClientDashboard() {
  const [masterServerAddress, setMasterServerAddress] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');
  const [connectedToMaster, setConnectedToMaster] = useState(false);
  const [servers, setServers] = useState<Server[]>([]);
  const [id, setId] = useState('');
  const [bidAmount, setBidAmount] = useState('');
  const [t, setT] = useState<number>(0);
  const [n, setN] = useState<number>(0);
  const [reconstructedSecret, setReconstructedSecret] = useState<
    [string, number][]
  >([]);
  const [isSecretReconstructed, setIsSecretReconstructed] =
    useState<boolean>(false);

  const connectToMasterServer = async () => {
    if (!masterServerAddress) {
      setError('Please enter a master server address');
      return;
    }

    setIsConnecting(true);
    setError('');

    await getInitialValues(setT, setN, setServers, masterServerAddress);

    setConnectedToMaster(true);
    setIsConnecting(false);
  };

  const refreshServerList = async () => {
    if (!connectedToMaster) return;

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setServers(
        servers.map((server) => ({
          ...server,
          lastSynced: new Date().toISOString(),
        })),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleMutiplicationClick = async () => {
    const secrets = await handleMultiplication(
      Number(id),
      9999,
      getServerAddresses(servers),
    );
    setIsSecretReconstructed(true);
    setReconstructedSecret(secrets);
  };

  const handleBidSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!id || !bidAmount) {
      setError('Please enter both an ID and bid amount');
      return;
    }

    if (
      isNaN(Number.parseFloat(bidAmount)) ||
      Number.parseFloat(bidAmount) <= 0
    ) {
      setError('Bid amount must be a positive number');
      return;
    }

    setError('');

    await handleShamir(
      Number(bidAmount),
      Number(id),
      t,
      n,
      getServerAddresses(servers),
    );

    setTimeout(() => {
      setId('');
      setBidAmount('');
    }, 1000);
  };

  return (
    <>
      <Navbar isLogged />
      <main className='container py-6'>
        <div className='flex flex-col gap-6 items-start lg:flex-row'>
          <div className='w-full bg-secondary border border-primary-border p-6 rounded-xl shadow-sm lg:basis-1/2 lg:w-auto'>
            <h2 className='text-xl font-bold tracking-wide font-headline lg:text-2xl'>
              Server Connection
            </h2>
            <p className='text-sm md:text-base'>
              Connect to a master server to retrieve information about all
              available auction servers
            </p>
            <div className='pt-6'>
              <div className='w-full flex justify-between items-end gap-4'>
                <FormField
                  id='masterServer'
                  text='Master server'
                  value={masterServerAddress}
                  setValue={setMasterServerAddress}
                  placeholder='https://master-server.example.com'
                  type='text'
                />
                <Button
                  variant='default'
                  onClick={connectToMasterServer}
                  disabled={isConnecting || connectedToMaster}
                  style='flex items-center gap-2'
                >
                  <LuServer className='h-4 w-4' />
                  Connect
                </Button>
              </div>
              {connectedToMaster && (
                <>
                  <div className='flex items-center justify-between mt-6 mb-4'>
                    <h3 className='text-sm lg:text-base'>Available Servers</h3>
                    <Button
                      variant='outline'
                      onClick={refreshServerList}
                      style='flex items-center gap-2'
                    >
                      <IoMdRefresh className='h-4 w-4' />
                      Refresh
                    </Button>
                  </div>
                  <table>
                    <thead>
                      <tr className='flex justify-around rounded-t-xl bg-emerald-100'>
                        <th className='basis-1/2'>Name</th>
                        <th className='basis-1/2'>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {servers.map((server) => (
                        <tr key={server.id} className='flex items-center'>
                          <td className='basis-1/2'>{server.address}</td>
                          <td className='basis-1/2'>
                            <ServerStatus status={server.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </div>
          </div>
          <div className='w-full bg-secondary border border-primary-border p-6 rounded-xl shadow-sm lg:basis-1/2 lg:w-auto'>
            <h2 className='text-xl font-bold tracking-wide font-headline lg:text-2xl'>
              Submit Bid
            </h2>
            <p className='text-sm md:text-base'>
              Enter your ID and amount to participate in the auction
            </p>
            <div className='flex flex-col gap-4 pt-6'>
              <FormField
                id='id'
                text='ID'
                value={id}
                setValue={setId}
                placeholder='Enter your ID'
                type='text'
              />
              <FormField
                id='bidAmount'
                text='Bid Amount'
                value={bidAmount}
                setValue={setBidAmount}
                placeholder='Enter your bid amount'
                type='number'
              />
              <Button
                variant='default'
                disabled={!connectedToMaster || !id || !bidAmount}
                style='flex justify-center items-center gap-2'
                onClick={handleBidSubmit}
              >
                Submit Bid <IoMdSend className='h-4 w-4' />
              </Button>
            </div>
            {!connectedToMaster && (
              <div className='flex items-center gap-2 mt-4 px-4 py-2 text-xs rounded-xl bg-teal-100 lg:text-sm'>
                <MdOutlineInfo className='h-4 w-4' />
                You must connect to a server before submitting a bid
              </div>
            )}
            <Button onClick={handleMutiplicationClick} variant={'ghost'}>
              Reconstruct Secret
            </Button>
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
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
