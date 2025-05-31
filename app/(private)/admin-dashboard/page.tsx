'use client';

import { useEffect, useState } from 'react';
import Button from '../../components/ui/button';
import Footer from '../../components/footer';
import Navbar from '../../components/navbar';
import {
  MdCloudUpload,
  MdGavel,
  MdOutlineRefresh,
  MdRestore,
} from 'react-icons/md';
import type { Server } from './interface';
import {
  getBiddersIds,
  hardReset,
  performComparison,
  sendInitialData,
} from './helpers';
import {
  getServerAddresses,
  handleAllServersStatus,
  handleCheckStatus,
} from '../../globalHelpers';
import { toast } from 'react-toastify';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '@/app/context/AuthContext';
import { getServersList } from '@/app/utils/auth';
import { REFRESH_INTERVAL, PRIME_NUMBER, l, k } from '@/app/constants';
import { dataValidation } from '../../globalHelpers';

export default function AdminDashboard() {
  const { user, servers: authServers } = useAuth();
  const [servers, setServers] = useState<Server[]>([]);
  const [isAuctionInProgress, setIsAuctionInProgress] =
    useState<boolean>(false);
  const [isInitialServersListLoaded, setIsInitialServersListLoaded] =
    useState<boolean>(false);

  const handleClearData = () => {
    setServers([]);
    if (user?.admin) {
      const savedServers = getServersList();
      const initialServers: Server[] = savedServers.map((server) => ({
        id: server,
        name: server,
        address: server,
        status: 'offline' as const,
      }));
      setServers(initialServers);
      // Perform a single status check
      handleAllServersStatus(initialServers, setServers);
    }
  };

  // Initialize available servers from auth context

  // Handle master server connection

  const handleStartAuction = async () => {
    const serverAddresses = getServerAddresses(servers);

    const loadingToastId = toast.loading(
      'Auction in progress - comparing bids...',
      {
        closeOnClick: false,
        draggable: false,
        autoClose: false,
      },
    ) as unknown as string; // Cast the toast ID to string
    setIsAuctionInProgress(true);

    const biddersIdsInfo = await getBiddersIds(serverAddresses);
    if (typeof biddersIdsInfo === 'string') {
      toast.dismiss(loadingToastId);
      toast.error('Failed to retrieve bidder IDs: ' + biddersIdsInfo, {
        autoClose: false,
        closeOnClick: true,
        draggable: true,
      });
      setIsAuctionInProgress(false);
      return;
    }

    if (serverAddresses.length < 2) {
      toast.dismiss(loadingToastId);
      toast.error('Not enough bidders found for the auction.', {
        autoClose: false,
        closeOnClick: true,
        draggable: true,
      });
      setIsAuctionInProgress(false);
      return;
    }

    try {
      await performComparison(serverAddresses, biddersIdsInfo, loadingToastId);
      setIsAuctionInProgress(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.dismiss(loadingToastId);
      toast.error(
        'An error occurred during the auction process: ' +
          (err?.message || 'Unknown error'),
        {
          autoClose: false,
          closeOnClick: true,
          draggable: true,
        },
      );
      setIsAuctionInProgress(false);
    }
  };

  const handleSendInitialData = () => {
    if (servers.length === 0) {
      toast.error('No servers available to send initial data.');
      return;
    }
    const serverAddresses = getServerAddresses(servers);
    sendInitialData(serverAddresses);
  };

  useEffect(() => {
    if (user?.admin) {
      const savedServers = getServersList();
      const initialServers: Server[] = savedServers.map((server) => ({
        id: server,
        name: server,
        address: server,
        status: 'offline' as const,
      }));
      setServers(initialServers);
      setIsInitialServersListLoaded(true);

      // Initial server status check
      handleAllServersStatus(initialServers, setServers);
    } else {
      setServers([]);
    }
  }, [user, authServers]);

  // Set up interval for server status checking using handleAllServersStatus
  useEffect(() => {
    if (servers.length === 0) return;

    // Function to check all servers at once
    const checkAllServers = () => {
      if (!isAuctionInProgress && isInitialServersListLoaded) {
        handleAllServersStatus(servers, setServers);
      }
    };

    // Set up automatic refresh
    const intervalId = setInterval(checkAllServers, REFRESH_INTERVAL);

    // Initial check
    checkAllServers();

    // Cleanup on unmount or dependency change
    // eslint-disable-next-line consistent-return
    return () => {
      clearInterval(intervalId);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuctionInProgress, isInitialServersListLoaded]);

  return (
    <ProtectedRoute adminOnly>
      <Navbar isLogged />
      <main className='container py-6'>
        <div className='flex flex-col gap-4 items-start lg:flex-row'>
          <div className='w-full h-full flex flex-row gap-4 lg:h-1/2'>
            <div className='basis-full flex flex-col gap-4'>
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
                        disabled={isAuctionInProgress}
                        onClick={() =>
                          hardReset(
                            getServerAddresses(servers),
                            handleClearData,
                          )
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
                        <MdCloudUpload className='h-4 w-4' />
                      </Button>
                    </li>
                  </ul>
                </div>
              </div>
              <div className='w-full bg-secondary border border-primary-border p-6 rounded-xl shadow-sm'>
                <h2 className='text-xl font-bold tracking-wide font-headline lg:text-2xl'>
                  Parameters
                </h2>
                <p className='text-sm md:text-base'>Current parameters</p>
                <div className='pt-6'>
                  <div className='space-y-3'>
                    <div className='flex items-center gap-2'>
                      Prime (p):
                      <span className='bg-teal-200 px-3 rounded-2xl'>
                        {Number(PRIME_NUMBER)}
                      </span>
                    </div>
                    <div className='flex items-center gap-2'>
                      Security Parameter (k):
                      <span className='bg-teal-200 px-3 rounded-2xl'>{k}</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      Bid Max Bit Length (l):
                      <span className='bg-teal-200 px-3 rounded-2xl'>{l}</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      Bid value range (2 ^ l - 1):
                      <span className='bg-teal-200 px-3 rounded-2xl'>
                        1 - {dataValidation.getMaxBid(l)}
                      </span>
                    </div>
                  </div>
                </div>
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
                              onClick={() => {
                                handleCheckStatus(
                                  server.id,
                                  servers,
                                  setServers,
                                  isAuctionInProgress,
                                );
                              }}
                              disabled={
                                server.status === 'checking' ||
                                isAuctionInProgress
                              }
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
