'use client';

import { useState } from 'react';
import Button from '../components/ui/button';
import Footer from '../components/footer';
import Navbar from '../components/navbar';
import BidServerPanel from '../components/bidServerPanel';
import { MdOutlineDelete } from 'react-icons/md';

interface Server {
  id: string;
  name: string;
  address: string;
  status: 'online' | 'offline';
}

export default function AdminDashboard() {
  const [servers, setServers] = useState<Server[]>([
    {
      id: '1',
      name: 'Main Server',
      address: 'https://auction-server-1.example.com',
      status: 'online',
    },
    {
      id: '2',
      name: 'Backup Server',
      address: 'https://auction-server-2.example.com',
      status: 'online',
    },
  ]);

  const [serverName, setServerName] = useState('');
  const [serverAddress, setServerAddress] = useState('');
  const [t, setT] = useState('');
  const [n, setN] = useState('');

  const handleAddServer = (e: React.FormEvent) => {
    e.preventDefault();
    if (serverName && serverAddress) {
      const server: Server = {
        id: Date.now().toString(),
        name: serverName,
        address: serverAddress,
        status: 'online',
      };
      setServers([...servers, server]);
      setServerName('');
      setServerAddress('');
    }
  };

  const handleSetInitialValues = (e: React.FormEvent) => {
    e.preventDefault();
    if (t && n) {
      // Set initial values
    }
  };

  const handleRemoveServer = (id: string) => {
    setServers(servers.filter((server) => server.id !== id));
  };

  return (
    <>
      <Navbar isLogged />
      <main className='container py-6'>
        <div className='flex flex-col gap-6 items-start lg:flex-row'>
          <div className='w-full flex flex-col gap-6 lg:w-1/2'>
            <BidServerPanel
              headline='Set initial values'
              description='Set the initial values for the auction'
              firstValue={t}
              setFirstValue={setT}
              secondValue={n}
              setSecondValue={setN}
              onSubmit={handleSetInitialValues}
              connectedToMaster
              initialValues
              isAdmin
            />
            <BidServerPanel
              headline='Add new server'
              description='Add a new server to the auction network'
              firstValue={serverName}
              setFirstValue={setServerName}
              secondValue={serverAddress}
              setSecondValue={setServerAddress}
              onSubmit={handleAddServer}
              connectedToMaster
              isAdmin
            />
          </div>
          <div className='w-full bg-secondary border border-primary-border p-6 rounded-xl shadow-sm lg:w-1/2'>
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
                        <td className='basis-3/10 sm:basis-5/10'>
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
      </main>
      <Footer />
    </>
  );
}
