import type { PromiseResult, StringNumberPair, StringPair } from '../interface';

export interface Server {
  id: string;
  name: string;
  address: string;
  status: 'online' | 'offline';
}

export interface PromiseResultWithSecrets extends PromiseResult {
  secrets: StringNumberPair[];
}

export interface PromiseResultFinalSecrets extends PromiseResult {
  finalSecrets: StringPair[];
}
