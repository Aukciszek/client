import type { Dispatch, FormEvent, SetStateAction } from 'react';

export interface BidServerPanelProps {
  headline: string;
  description: string;
  connectedToMaster?: boolean;
  isDisabled?: boolean;
  // eslint-disable-next-line no-unused-vars
  onSubmit: (() => void) | ((e: FormEvent) => void);
  isAdmin?: boolean;
  firstValue: string;
  secondValue: string;
  setFirstValue: Dispatch<SetStateAction<string>>;
  setSecondValue: Dispatch<SetStateAction<string>>;
  initialValues?: boolean;
}
