import type { SetBoolean, SetNumber, SetStringArray } from '@/app/interface';
import { toast } from 'react-toastify';

export const getInitialValues = async (
  setT: SetNumber,
  setN: SetNumber,
  setServers: SetStringArray,
  setIsValuesServerInitialized: SetBoolean,
  initialValuesServer: string,
): Promise<void> => {
  await fetch(`${initialValuesServer}/api/initial-values`)
    .then(async (res) => {
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.detail);
        setIsValuesServerInitialized(false);
      } else {
        setT(data.t);
        setN(data.n);
        setServers(data.parties);
        toast.success(data.result);
        setIsValuesServerInitialized(true);
      }
    })
    .catch((err) => {
      toast.error(err.message);
    });
};

export const checkInputs = (
  t: number,
  n: number,
  servers: string[],
  isInitialValuesServerInitialized: boolean,
  setFirstStep: SetBoolean,
): void => {
  const messageQSuccess: [string, string][] = [];
    const messageQError: [string, string][] = [];

    if (!isInitialValuesServerInitialized) {
      messageQError.push([
        'InitialValuesServer',
        'Initial values server should be initialized',
      ]);
    }
    if (n == 0) {
      messageQError.push(['n', 'n should be greater than 0']);
    }
    if (t > n) {
      messageQError.push(['t > n', 't should not be greater than n']);
    }
    if (t == 0) {
      messageQError.push(['t', 't should be greater than 0']);
    }
    if (servers.length == 0) {
      messageQError.push(['No servers added', 'More than 0 servers should be added']);
    }
    if (messageQError.length !== 0) {
      toast.error(
        <div>
          {messageQError.map(([title, message]) => (
            <p key={title}>
              <span className='font-bold'>{title}</span>: {message}
            </p>
          ))}
        </div>,
      );
    } else {
      messageQSuccess.push(['Success', 'All inputs are correct']);
      toast.success(
        <div>
          {messageQSuccess.map(([title, message]) => (
            <p key={title}>
              <span className='font-bold'>{title}</span>: {message}
            </p>
          ))}
        </div>,
      );
      setFirstStep(false);
    }
};
