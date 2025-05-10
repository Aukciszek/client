import type { Server } from './(private)/admin-dashboard/interface';

export const getServerAddresses = (servers: Server[]): string[] =>
  servers.map((server) => server.address);
