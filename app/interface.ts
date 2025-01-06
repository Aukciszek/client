import type { Dispatch, SetStateAction } from 'react';

export type SetNumber = Dispatch<SetStateAction<number>>;
export type SetString = Dispatch<SetStateAction<string>>;
export type SetBoolean = Dispatch<SetStateAction<boolean>>;
export type SetStringArray = Dispatch<SetStateAction<string[]>>;

export interface MainProps {
  t: number;
  n: number;
  servers: string[];
}

export interface MainPropsWithSetters extends MainProps {
  setT: SetNumber;
  setN: SetNumber;
  setServers: SetStringArray;
}

export interface MainSettersWithStep extends MainPropsWithSetters {
  setFirstStep: SetBoolean;
}

export interface MainPropsWithStep extends MainProps {
  setFirstStep: SetBoolean;
}
