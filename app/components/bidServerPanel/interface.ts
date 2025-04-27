import type { Dispatch, SetStateAction } from 'react';

export interface BidServerPanelProps {
  headline: string;
  description: string;
  isDisabled?: boolean;
  // eslint-disable-next-line no-unused-vars
  onSubmit: string | ((formData: FormData) => void | Promise<void>) | undefined;
  isAdmin?: boolean;
  firstValue: string;
  secondValue: string;
  setFirstValue: Dispatch<SetStateAction<string>>;
  setSecondValue: Dispatch<SetStateAction<string>>;
  initialValues?: boolean;
}
