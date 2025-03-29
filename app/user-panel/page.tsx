'use client';

import { useState } from 'react';
import Button from '../components/ui/button';
import Footer from '../components/footer';
import { LuServer } from 'react-icons/lu';
import { IoMdRefresh } from 'react-icons/io';
import Navbar from '../components/navbar';
import FormField from '../components/ui/formField';
import BidServerPanel from '../components/bidServerPanel';
import { Server } from 'http';
import ServerStatus from '../components/ui/serverStatus';

interface ServerInfo {
  id: string;
  name: string;
  address: string;
  status: 'online' | 'offline';
  lastSynced: string;
}

export default function ClientDashboard() {
  const [masterServerAddress, setMasterServerAddress] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');
  const [connectedToMaster, setConnectedToMaster] = useState(false);
  const [servers, setServers] = useState<ServerInfo[]>([]);
  const [id, setId] = useState('');
  const [bidAmount, setBidAmount] = useState('');

  const connectToMasterServer = async () => {
    if (!masterServerAddress) {
      setError('Please enter a master server address');
      return;
    }

    setIsConnecting(true);
    setError('');

    try {
      //get server list
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const mockServers: ServerInfo[] = [
        {
          id: '1',
          name: 'Primary Auction Server',
          address: 'https://auction-server-1.example.com',
          status: 'online',
          lastSynced: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Secondary Auction Server',
          address: 'https://auction-server-2.example.com',
          status: 'online',
          lastSynced: new Date().toISOString(),
        },
        {
          id: '3',
          name: 'Backup Server',
          address: 'https://auction-backup.example.com',
          status: 'offline',
          lastSynced: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        },
      ];

      setServers(mockServers);
      setConnectedToMaster(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsConnecting(false);
    }
  };

  const refreshServerList = async () => {
    if (!connectedToMaster) return;

    try {
      // Refresh server list
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

  const handleBidSubmit = () => {
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
                          <td className='basis-1/2'>{server.name}</td>
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
          <BidServerPanel
            headline='Submit Bid'
            description='Enter your ID and amount to participate in the auction'
            firstValue={id}
            setFirstValue={setId}
            secondValue={bidAmount}
            setSecondValue={setBidAmount}
            connectedToMaster={connectedToMaster}
            onSubmit={handleBidSubmit}
            isDisabled={!connectedToMaster || !id || !bidAmount}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
