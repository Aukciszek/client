import { toast } from 'react-toastify';

export const reset = async (servers: string[]): Promise<void> => {
  const messageSuccess: [string, string][] = [];
  const messageError: [string, string][] = [];

  const promises = servers.map((server) =>
    fetch(`${server}/api/reset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
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

  if (messageError.length !== 0) {
    toast.error(
      <div>
        {messageError.map(([server, result]) => (
          <p key={server}>
            <span className='font-bold'>{server}</span>: {result}
          </p>
        ))}
      </div>,
    );
  }

  if (messageSuccess.length !== 0) {
    toast.success(
      <div>
        {messageSuccess.map(([server, result]) => (
          <p key={server}>
            <span className='font-bold'>{server}</span>: {result}
          </p>
        ))}
      </div>,
    );
  }
};

export const hardReset = async (servers: string[]): Promise<void> => {
  const messageSuccess: [string, string][] = [];
  const messageError: [string, string][] = [];

  const promises = servers.map((server) =>
    fetch(`${server}/api/factory-reset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
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

  if (messageError.length !== 0) {
    toast.error(
      <div>
        {messageError.map(([server, result]) => (
          <p key={server}>
            <span className='font-bold'>{server}</span>: {result}
          </p>
        ))}
      </div>,
    );
  }

  if (messageSuccess.length !== 0) {
    toast.success(
      <div>
        {messageSuccess.map(([server, result]) => (
          <p key={server}>
            <span className='font-bold'>{server}</span>: {result}
          </p>
        ))}
      </div>,
    );
  }
};
