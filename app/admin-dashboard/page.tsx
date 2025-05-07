'use client';

import { useEffect, useState } from 'react';
import Button from '../components/ui/button';
import Footer from '../components/footer';
import Navbar from '../components/navbar';
import BidServerPanel from '../components/bidServerPanel';
import { MdGavel, MdOutlineDelete, MdRestore } from 'react-icons/md';
import type { Server } from './interface';
import {
  getBiddersIds,
  getRandomString,
  handleBiddersIdsToast,
  hardReset,
  performComparison,
  sendInitialData,
} from './helpers';
import { getServerAddresses } from '../globalHelpers';
import { toast } from 'react-toastify';

export default function AdminDashboard() {
  const [servers, setServers] = useState<Server[]>([]);

  const [serverName, setServerName] = useState('');
  const [serverAddress, setServerAddress] = useState('');
  const [t, setT] = useState('');
  const [n, setN] = useState('');

  const handleAddServer = () => {
    setServers([
      ...servers,
      {
        id: getRandomString(),
        name: serverName,
        address: serverAddress,
        status: 'online',
      },
    ]);
    toast.success('Server added successfully!', {
      autoClose: 5000,
      closeOnClick: true,
      draggable: true,
    });
    setServerName('');
    setServerAddress('');
  };

  const sendInitialDataWithServers = sendInitialData.bind(
    null,
    getServerAddresses(servers),
  );

  const handleRemoveServer = (id: string) => {
    setServers(servers.filter((server) => server.id !== id));
    toast.success('Server removed successfully!', {
      autoClose: 5000,
      closeOnClick: true,
      draggable: true,
    });
  };

  const handleClearData = () => {
    setT('0');
    setN('0');
    setServers([]);
  };

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
    if (biddersIdsInfo.length < 2) return; 

    await performComparison(serverAddresses, biddersIdsInfo)
  };

  return (
    <>
      <Navbar isLogged />
      <main className='container py-6'>
        <div className='flex flex-col gap-6 items-start lg:flex-row'>
          <div className='w-full flex flex-col gap-6 lg:w-1/2'>
            <BidServerPanel
              headline='Add new server'
              description='Add a new server to the auction network'
              firstValue={serverName}
              setFirstValue={setServerName}
              secondValue={serverAddress}
              setSecondValue={setServerAddress}
              onSubmit={handleAddServer}
              isDisabled={!serverName || !serverAddress}
              isAdmin
            />
            <BidServerPanel
              headline='Set initial values'
              description='Set the initial values for the auction'
              firstValue={t}
              setFirstValue={setT}
              secondValue={n}
              setSecondValue={setN}
              onSubmit={sendInitialDataWithServers}
              isDisabled={!t || !n}
              initialValues
              isAdmin
            />
          </div>
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
                        <th className='basis-3/10 sm:basis-2/10'>Name</th>
                        <th className='basis-3/10 sm:basis-5/10'>Address</th>
                        <th className='basis-2/10 sm:basis-2/10'>Status</th>
                        <th className='basis-2/10 sm:basis-1/10'>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {servers.map((server) => (
                        <tr key={server.id} className='flex items-center'>
                          <td className='basis-3/10 sm:basis-2/10'>
                            {server.name}
                          </td>
                          <td className='basis-3/10 text-center sm:basis-5/10'>
                            {server.address}
                          </td>
                          <td className='basis-2/10 sm:basis-2/10'>
                            <div
                              className={`w-min mx-auto rounded-full px-2 py-1 text-xs lg:text-sm lg:px-3 lg:py-1.5 ${
                                server.status === 'online'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {server.status}
                            </div>
                          </td>
                          <td className='basis-2/10 flex justify-center sm:basis-1/10'>
                            <Button
                              variant='ghost'
                              onClick={() => handleRemoveServer(server.id)}
                            >
                              <MdOutlineDelete className='h-4 w-4' />
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
    </>
  );
}
