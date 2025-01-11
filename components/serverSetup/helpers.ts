import type { SetNumber, SetString, SetStringArray } from './interface';

export const getInitialValues = async (
  setT: SetNumber,
  setN: SetNumber,
  setServers: SetStringArray,
  initialValuesServer: string,
  setGetInitialValuesError: SetString,
): Promise<void> => {
  await fetch(`${initialValuesServer}/api/initial-values`).then(async (res) => {
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
