import type { Dispatch, SetStateAction } from 'react';

export type SetNumber = Dispatch<SetStateAction<number>>;
export type SetString = Dispatch<SetStateAction<string>>;
export type SetBoolean = Dispatch<SetStateAction<boolean>>;
export type SetStringArray = Dispatch<SetStateAction<string[]>>;
export type SetStringNumberPairsArray = Dispatch<
  SetStateAction<[string, number][]>
>;

export interface MainProps {
  t: number;
  n: number;
  servers: string[];
}

export interface MainPropsWithSetters extends MainProps {
  allowNavigation: boolean;
  setT: SetNumber;
  setN: SetNumber;
  setServers: SetStringArray;
  setAllowNavigation: SetBoolean;
}

export interface MainSettersWithStep extends MainPropsWithSetters {
  initialValuesServer: string;
  currentServer: string;
  setInitialValuesServer: SetString;
  setCurrentServer: SetString;
  setFirstStep: SetBoolean;
}

export interface MainPropsWithStep extends MainProps {
  id: number;
  secret: number;
  reconstructedSecret: [string, number][];
  firstClientId: number;
  secondClientId: number;
  isSecretReconstructed: boolean;
  setFirstStep: SetBoolean;
  setId: SetNumber;
  setSecret: SetNumber;
  setReconstructedSecret: SetStringNumberPairsArray;
  setFirstClientId: SetNumber;
  setSecondClientId: SetNumber;
  setIsSecretReconstructed: SetBoolean;
}

export interface Server {
  id: string;
  name: string;
  address: string;
  status: 'online' | 'offline' | 'checking';
}
