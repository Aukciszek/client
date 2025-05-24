'use client';

import { useState, useEffect } from 'react';
import Button from '../../components/ui/button';
import Footer from '../../components/footer';
import { IoMdRefresh, IoMdSend } from 'react-icons/io';
import Navbar from '../../components/navbar';
import FormField from '../../components/ui/formField';
import ServerStatus from '../../components/ui/serverStatus';
import { getInitialValues, getServerAddresses, handleAllServersStatus, handleCheckStatus } from '../../globalHelpers';
import type { Server } from '../../globalInterface';
import { MdOutlineInfo, MdOutlineRefresh } from 'react-icons/md';
import { handleShamir } from './helpers';
import { toast } from 'react-toastify';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '@/app/context/AuthContext';

export default function ClientDashboard() {
  const { user, servers: authServers } = useAuth();
  const [servers, setServers] = useState<Server[]>([]);
  const [bidAmount, setBidAmount] = useState('');
  const [t, setT] = useState<number>(0);
  const [n, setN] = useState<number>(0);

  // Initialize available servers from auth context and check their status
  useEffect(() => {
    if (authServers.length > 0) {
      const initialServers: Server[] = authServers.map((server) => ({
        id: server,
        name: server,
        address: server,
        status: 'offline' as const,
      }));
      setServers(initialServers);
      handleAllServersStatus(initialServers, setServers);
      
      // Try to get initial values from the first server
      /* getInitialValues(setT, setN, setServers, authServers[0])
        .catch(() => {
          // Silently fail if we can't get initial values
          toast.info('Waiting for servers to be initialized...');
        }); */
    }
  }, [authServers]);

  const refreshServerList = () => {
    if (servers.length > 0) {
      handleAllServersStatus(servers, setServers);
    }
  };

  const handleBidSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (
      isNaN(Number.parseFloat(bidAmount)) ||
      Number.parseFloat(bidAmount) <= 0
    ) {
      toast.error('Bid amount must be a positive number', {
        autoClose: false,
        closeOnClick: true,
        draggable: true,
      });
      return;
    }

    if (!user?.uid) {
      toast.error('User ID not available', {
        autoClose: false,
        closeOnClick: true,
        draggable: true,
      });
      return;
    }

    await handleShamir(
      Number(bidAmount),
      user.uid,
      t,
      n,
      getServerAddresses(servers),
    );

    setTimeout(() => {
      setBidAmount('');
    }, 1000);
  };

  return (
    <ProtectedRoute>
      <Navbar isLogged />
      <main className='container py-6'>
        <div className='flex flex-col gap-6 items-start lg:flex-row'>
          <div className='w-full bg-secondary border border-primary-border p-6 rounded-xl shadow-sm lg:basis-1/2 lg:w-auto'>
            <h2 className='text-xl font-bold tracking-wide font-headline lg:text-2xl'>
              Available Servers
            </h2>
            <p className='text-sm md:text-base'>
              Status of auction servers
            </p>
            <div className='pt-6'>
              <div className='w-full'>
              {servers.length > 0 ? (
                <>
                  <div className='flex items-center justify-between mt-6 mb-4'>
                    <Button
                      variant='outline'
                      onClick={refreshServerList}
                      style='flex items-center gap-2'
                    >
                      <IoMdRefresh className='h-4 w-4' />
                      Check Status
                    </Button>
                  </div>
                  <table>
                    <thead>
                      <tr className='flex justify-around rounded-t-xl bg-emerald-100'>
                        <th className='basis-3/10 sm:basis-3/10'>Name</th>
                        <th className='basis-3/10 sm:basis-4/10'>Address</th>
                        <th className='basis-2/10 sm:basis-2/10'>Status</th>
                        <th className='basis-2/10 sm:basis-1/10'>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {servers.map((server) => (
                        <tr key={server.id} className='flex items-center'>
                          <td className='basis-3/10 sm:basis-3/10'>
                            {server.name}
                          </td>
                          <td className='basis-3/10 text-center sm:basis-4/10'>
                            {server.address}
                          </td>
                          <td className='basis-2/10 sm:basis-2/10'>
                            <div
                              className={`w-min mx-auto rounded-full px-2 py-1 text-xs lg:text-sm lg:px-3 lg:py-1.5 ${
                                server.status === 'online' ? 'bg-green-100 text-green-800' :
                                server.status === 'checking' ? 'bg-amber-100 text-amber-800' :
                                'bg-red-100 text-red-800'
                              }`}
                            >
                              {server.status}
                            </div>
                          </td>
                          <td className='basis-2/10 flex justify-center sm:basis-1/10'>
                            <Button
                              variant='ghost'
                              onClick={() => handleCheckStatus(server.id, servers, setServers)}
                              disabled={server.status === 'checking'}
                            >
                              <MdOutlineRefresh 
                              className={`h-4 w-4 ${server.status === 'checking' ? 'animate-spin' : ''}`} 
                              />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              ) : (
                <div className='flex items-center gap-2 mt-4 px-4 py-2 text-sm rounded-xl bg-teal-100'>
                  <MdOutlineInfo className='h-4 w-4' />
                  No servers available
                </div>
              )}
              </div>
            </div>
          </div>
          <div className='w-full bg-secondary border border-primary-border p-6 rounded-xl shadow-sm lg:basis-1/2 lg:w-auto'>
            <h2 className='text-xl font-bold tracking-wide font-headline lg:text-2xl'>
              Submit Bid
            </h2>
            <p className='text-sm md:text-base'>
              Enter your amount to participate in the auction
            </p>
            <div className='flex flex-col gap-4 pt-6'>
              <FormField
                id='id'
                text='ID'
                value={user?.uid.toString() || ''}
                placeholder='Your ID'
                type='text'
                disabled
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
                disabled={!servers.some(s => s.status === 'online') || !user?.uid || !bidAmount}
                style='flex justify-center items-center gap-2'
                onClick={handleBidSubmit}
              >
                Submit Bid <IoMdSend className='h-4 w-4' />
              </Button>
            </div>
            {!servers.some(s => s.status === 'online') && (
              <div className='flex items-center gap-2 mt-4 px-4 py-2 text-xs rounded-xl bg-teal-100 lg:text-sm'>
                <MdOutlineInfo className='h-4 w-4' />
                Waiting for servers to be online...
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </ProtectedRoute>
  );
}
