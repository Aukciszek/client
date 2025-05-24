import Cookies from 'universal-cookie';
import { getServersList, getTokenForServer } from './utils/auth';
import { toast } from 'react-toastify';
import { Server, SetNumber } from './globalInterface';
import { Dispatch, SetStateAction } from 'react';

export const getServerAddresses = (servers: Server[]): string[] =>
  servers.map((server) => server.address);

export const getInitialValues = async (
  setT: SetNumber,
  setN: SetNumber,
  setServers: Dispatch<SetStateAction<Server[]>>,
  initialValuesServer: string,
): Promise<void> => {
  const messageInfo: string[] = [];

  // Log the server we're trying to get a token for
  console.log('Requesting token for server:', initialValuesServer);
  const token = getTokenForServer(initialValuesServer);

  if (!token) {
    console.error('No token found in cookies for server:', initialValuesServer);
    const cookies = new Cookies();
    const allTokens = cookies.get('access_tokens');
    console.log('All available tokens:', allTokens);
    toast.error('Authentication token not found. Please try logging in again.');
    return;
  }

  await fetch(`${initialValuesServer}/api/initial-values`, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })
    .then(async (res) => {
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.detail);
        setT(0);
        setN(0);
        setServers([]);
        throw new Error(data.detail);
      }

      setT(data.t);
      setN(data.n);
      // Get the current auth servers list to properly map server addresses
      const authServers = getServersList();
      const availableServers = data.parties.map((party: string) => {
        // Try to find matching server from auth context to get the proper name
        const matchingAuthServer = authServers.find(
          (server) => server === party,
        );
        return {
          id: party,
          name: matchingAuthServer || party,
          address: party,
          status: 'online',
        };
      });
      setServers(availableServers);
      messageInfo.push(data.result);
      toast.success('Successfully retrieved server addresses');
    })
    .catch((err) => {
      const error = err.message;
      toast.error(error);
      setT(0);
      setN(0);
      setServers([]);
      throw err;
    });
};

export const checkServerStatus = async (
  server: string,
): Promise<boolean> => {
  try {
    const response = await fetch(`${server}api/status`, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${getTokenForServer(server)}`,
      },
    });
    return response.ok;
  } catch {
    return false;
  }
};

// Replace handleRemoveServer with:
export const handleCheckStatus = async (id: string, servers: Server[], setServers: Dispatch<SetStateAction<Server[]>>) => {
  
  const server = servers.find(s => s.id === id);
  if (!server) return;

  // Show loading state for this specific server
  setServers(prev => prev.map(s => 
    s.id === id 
      ? { ...s, status: 'checking' as const }
      : s
  ));

  const isOnline = await checkServerStatus(server.address);

  // Update status for just this server
  setServers(prev => prev.map(s => 
    s.id === id 
      ? { ...s, status: isOnline ? 'online' : 'offline' as const }
      : s
  ));

  toast.info(`Server ${server.name} is ${isOnline ? 'online' : 'offline'}`, {
    autoClose: 3000,
    closeOnClick: true,
    draggable: true,
  });
};

export const handleAllServersStatus = async (
  servers: Server[],
  setServers: Dispatch<SetStateAction<Server[]>>,
) => {
  servers.map((server) => {
      handleCheckStatus(server.id, servers, setServers);
  }
  );
};