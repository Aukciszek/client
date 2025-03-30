export interface Server {
  id: string;
  name: string;
  address: string;
  status: 'online' | 'offline';
}
