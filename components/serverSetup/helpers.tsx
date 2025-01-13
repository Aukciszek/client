import type { SetBoolean, SetNumber, SetStringArray } from '@/app/interface';
import { toast } from 'react-toastify';

export const getInitialValues = async (
  setT: SetNumber,
  setN: SetNumber,
  setServers: SetStringArray,
  setAllowNextPageNavigation: SetBoolean,
  initialValuesServer: string,
): Promise<void> => {
  await fetch(`${initialValuesServer}/api/initial-values`)
    .then(async (res) => {
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.detail);
        setAllowNextPageNavigation(false);
      } else {
        setT(data.t);
        setN(data.n);
        setServers(data.parties);
        toast.success(data.result);
        setAllowNextPageNavigation(true);
      }
    })
    .catch((err) => {
      toast.error(err.message);
      setAllowNextPageNavigation(false);
    });
};