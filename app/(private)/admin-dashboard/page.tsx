'use client';

import { useEffect, useState, useCallback } from 'react';
import Button from '../../components/ui/button';
import Footer from '../../components/footer';
import Navbar from '../../components/navbar';
import { MdGavel, MdOutlineRefresh, MdRestore } from 'react-icons/md';
import type { Server } from './interface';
import {
  getBiddersIds,
  handleBiddersIdsToast,
  hardReset,
  performComparison,
  sendInitialData,
} from './helpers';
import {
  getInitialValues,
  getServerAddresses,
  handleAllServersStatus,
  handleCheckStatus,
} from '../../globalHelpers';
import { toast } from 'react-toastify';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '@/app/context/AuthContext';

export default function AdminDashboard() {
  const { user, servers: authServers } = useAuth();
  const [servers, setServers] = useState<Server[]>([
    {
      id: '1',
      name: 'Server 1',
      address: 'http://localhost:5001',
      status: 'offline',
    },
    {
      id: '2',
      name: 'Server 2',
      address: 'http://localhost:5002',
      status: 'offline',
    },
    {
      id: '3',
      name: 'Server 3',
      address: 'http://localhost:5003',
      status: 'offline',
    },
    {
      id: '4',
      name: 'Server 4',
      address: 'http://localhost:5004',
      status: 'offline',
    },
    {
      id: '5',
      name: 'Server 5',
      address: 'http://localhost:5005',
      status: 'offline',
    },
  ]);
  const [t, setT] = useState<number>(0);
  const [n, setN] = useState<number>(0);

  const handleClearData = () => {
    setT(0);
    setN(0);
    setServers([]);
  };

  // Initialize available servers from auth context

  // Handle master server connection

  const handleStartAuction = async () => {
    const serverAddresses = getServerAddresses(servers);

    toast.loading('Starting the auction!');
    toast.dismiss();

    const biddersIdsInfo = await getBiddersIds(serverAddresses);

    handleBiddersIdsToast(
      biddersIdsInfo,
      'Successfully retrieved bidder IDs!',
      'Failed to retrieve bidder IDs!',
    );

    if (typeof biddersIdsInfo === 'string') return;

    await performComparison(serverAddresses, biddersIdsInfo);
  };

  const handleSendInitialData = () => {
    if (servers.length === 0) {
      toast.error('No servers available to send initial data.');
      return;
    }
    const serverAddresses = getServerAddresses(servers);
    sendInitialData(serverAddresses);
  };

  return (
    <ProtectedRoute adminOnly>
      <Navbar isLogged />
      <main className='container py-6'>
        <div className='flex flex-col gap-6 items-start lg:flex-row'>
          <div className='w-full flex flex-col gap-6 lg:w-1/2'>
            <div className='w-full bg-secondary border border-primary-border p-6 rounded-xl shadow-sm'>
              <h2 className='text-xl font-bold tracking-wide font-headline lg:text-2xl'>
                Action buttons
              </h2>
              <p className='text-sm md:text-base'>Set of available actions</p>
              <div className='pt-6'>
                <ul className='w-full flex flex-col justify-between items-center gap-4 min-[440px]:flex-row lg:justify-start'>
                  <li className='w-full lg:w-fit'>
                    <Button
                      style='w-full flex gap-2 justify-center items-center'
                      variant='default'
                      onClick={handleStartAuction}
                    >
                      Start auction
                      <MdGavel className='h-4 w-4' />
                    </Button>
                  </li>
                  <li className='w-full lg:w-fit'>
                    <Button
                      style='w-full flex gap-2 justify-center items-center'
                      variant='outline'
                      onClick={() =>
                        hardReset(getServerAddresses(servers), handleClearData)
                      }
                    >
                      Reset servers
                      <MdRestore className='h-4 w-4' />
                    </Button>
                  </li>
                  <li className='w-full lg:w-fit'>
                    <Button
                      style='w-full flex gap-2 justify-center items-center'
                      variant='outline'
                      onClick={() => handleSendInitialData()}
                    >
                      Send initial values
                      <MdRestore className='h-4 w-4' />
                    </Button>
                  </li>
                </ul>
              </div>
            </div>
            <div className='w-full bg-secondary border border-primary-border p-6 rounded-xl shadow-sm'>
              <h2 className='text-xl font-bold tracking-wide font-headline lg:text-2xl'>
                Server Status
              </h2>
              <p className='text-sm md:text-base'>
                Overview of all connected auction servers
              </p>
              <div className='pt-6'>
                <div className='w-full flex justify-between items-end gap-4'>
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
                                server.status === 'online'
                                  ? 'bg-green-100 text-green-800'
                                  : server.status === 'checking'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {server.status}
                            </div>
                          </td>
                          <td className='basis-2/10 flex justify-center sm:basis-1/10'>
                            <Button
                              variant='ghost'
                              onClick={() =>
                                handleCheckStatus(
                                  server.id,
                                  servers,
                                  setServers,
                                )
                              }
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
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </ProtectedRoute>
  );
}
