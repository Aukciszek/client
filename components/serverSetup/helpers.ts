import type { SetNumber, SetStringArray } from '@/app/interface';
import { toast } from 'react-toastify';

export const getInitialValues = async (
  setT: SetNumber,
  setN: SetNumber,
  setServers: SetStringArray,
  initialValuesServer: string,
): Promise<void> => {
  await fetch(`${initialValuesServer}/api/initial-values`).then(async (res) => {
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.detail);
    } else {
      setT(data.t);
      setN(data.n);
      setServers(data.parties);
      toast.success(data.result);
    }
  });
};
