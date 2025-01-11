import { toast } from 'react-toastify';
import { PRIME_NUMBER } from '../app/constants';

export const sendInitialData = async (
  servers: string[],
  formData: FormData,
): Promise<void> => {
  const t = Number(formData.get('t'));
  const n = Number(formData.get('n'));
  const messageSuccess: [string, string][] = [];
  const messageError: [string, string][] = [];

  const promises = servers.map((server, i) =>
    fetch(`${server}/api/initial-values`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        t,
        n,
        id: i + 1,
        p: PRIME_NUMBER,
        parties: servers,
      }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          messageError.push([server, data.detail]);
          return;
        }
        messageSuccess.push([server, data.result]);
      })
      .catch((err) => {
        messageError.push([server, err.message]);
      }),
  );

  await Promise.all(promises);

  if (messageError.length !== 0)
    toast.error(
      <div>
        {messageError.map(([server, result]) => (
          <p key={server}>
            <span className='font-bold'>{server}</span>: {result}
          </p>
        ))}
      </div>,
    );

  if (messageSuccess.length !== 0)
    toast.success(
      <div>
        {messageSuccess.map(([server, result]) => (
          <p key={server}>
            <span className='font-bold'>{server}</span>: {result}
          </p>
        ))}
      </div>,
    );
};