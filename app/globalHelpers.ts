import type { Server } from './admin-dashboard/interface';

export const getServerAddresses = (servers: Server[]): string[] =>
  servers.map((server) => server.address);
