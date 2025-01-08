import type { SetNumber, SetString, SetStringArray } from './interface';

export const getInitialValues = async (
  setT: SetNumber,
  setN: SetNumber,
  setServers: SetStringArray,
  setGetInitialValuesError: SetString,
): Promise<void> => {
  await fetch('http://localhost:5000/api/initial-values').then(async (res) => {
    const data = await res.json();
    if (!res.ok) {
      setGetInitialValuesError(data.detail);
    } else {
      setT(data.t);
      setN(data.n);
      setServers(data.parties);
      setGetInitialValuesError('');
    }
  });
};
