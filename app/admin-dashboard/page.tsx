'use client';

import { useState } from 'react';
import Button from '../components/ui/button';
import Footer from '../components/footer';
import Navbar from '../components/navbar';
import BidServerPanel from '../components/bidServerPanel';
import {
  MdGavel,
  MdOutlineDelete,
  MdRestore,
} from 'react-icons/md';
import type { Server } from './interface';
import { getRandomString, hardReset,  sendInitialData } from './helpers';
import { getServerAddresses } from '../globalHelpers';

export default function AdminDashboard() {
  const [servers, setServers] = useState<Server[]>([]);

  const [serverName, setServerName] = useState('');
  const [serverAddress, setServerAddress] = useState('');
  const [t, setT] = useState('');
  const [n, setN] = useState('');

  const handleAddServer = () => {
    setServers([
      ...servers,
      {
        id: getRandomString(),
        name: serverName,
        address: serverAddress,
        status: 'online',
      },
    ]);
    setServerName('');
    setServerAddress('');
  };

  const sendInitialDataWithServers = sendInitialData.bind(
    null,
    getServerAddresses(servers),
  );

  const handleRemoveServer = (id: string) => {
    setServers(servers.filter((server) => server.id !== id));
  };

  
  const handleClearDataFirstStep = () => {
    // setT(0);
    // setN(0);
    // setServers([]);
    // setInitialValuesServer('');
    // setCurrentServer('');
  };

  const handleClearDataSecondStep = () => {
    // setId(0);
    // setSecret(0);
    // setReconstructedSecret([]);
    // setFirstClientId(0);
    // setSecondClientId(0);
    // setIsSecretReconstructed(false);
  };


  const xor = async(
      parties,
      take_value_from_temporary_zZ,
      zZ_first_multiplication_factor,
      zZ_second_multiplication_factor,
  ) => {
      const tasks = [];

      // Calculate and share q for each party
      for (const party of parties) {
          tasks.push(
              fetch(`${party}/api/redistribute-q`, {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                  },
              })
          );
      }
      await Promise.all(tasks);
      console.log("q calculated and shared for all parties");

      // Calculate and share r for each party
      const tasks2 = [];
      for (const party of parties) {
          tasks2.push(
              fetch(`${party}/api/redistribute-r`, {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                      take_value_from_temporary_zZ: take_value_from_temporary_zZ,
                      zZ_first_multiplication_factor: zZ_first_multiplication_factor,
                      zZ_second_multiplication_factor: zZ_second_multiplication_factor,
                  }),
              })
          );
      }
      await Promise.all(tasks2);
      console.log("r calculated and shared for all parties");

      // Calculate the multiplicative share for each party
      const tasks3 = [];
      for (const party of parties) {
          tasks3.push(
              fetch(`${party}/api/calculate-multiplicative-share`, {
                  method: 'PUT',
                  headers: {
                      'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                      calculate_for_xor: true,
                  }),
              })
          );
      }
      await Promise.all(tasks3);
      console.log("Multiplicative shares calculated for all parties");

      // xor for all parties
      const tasks4 = [];
      for (const party of parties) {
          tasks4.push(
              fetch(`${party}/api/xor`, {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                      take_value_from_temporary_zZ: take_value_from_temporary_zZ,
                      zZ_first_multiplication_factor: zZ_first_multiplication_factor,
                      zZ_second_multiplication_factor: zZ_second_multiplication_factor,
                  }),
              })
          );
      }
      await Promise.all(tasks4);
      console.log("xor calculated for all parties");

      // Reset the calculation for parties
      const tasks5 = [];
      for (const party of parties) {
          tasks5.push(
              fetch(`${party}/api/reset-calculation`, {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                  },
              })
          );
      }
      await Promise.all(tasks5);
      console.log("Reset for all parties");
  }

  


  const romb = async (serverAdresses: string[]) => {
    const messageCalculateRomb: [string, string][] = [];
    const errorCalculateRomb: [string, string][] = [];
    let Qs = []
    let Rs = []
    let Multishares = []

    serverAdresses.map((server) =>
      fetch(`${server}/api/reset-calculation`, {
        method: 'GET',
        headers: {
          'content-type': 'application/json',
          Accept: 'application/json',
        },
      })
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok) {
            messageCalculateRomb.push([server, data.detail]);
            return;
          }
        })
        .catch((err) => {
          errorCalculateRomb.push([server, err.message]);
        }),
    );

    serverAdresses.map((server) =>
      fetch(`${server}/api/redistribute-q`, {
        method: 'GET',
        headers: {
          'content-type': 'application/json',
          Accept: 'application/json',
        },
      })
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok) {
            messageCalculateRomb.push([server, data.detail]);
            return;
          }
          Qs.push([server, data.secret]);
        })
        .catch((err) => {
          errorCalculateRomb.push([server, err.message]);
        }),
    );

    serverAdresses.map((server) =>
      fetch(`${server}/api/redistribute-r`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          take_value_from_temporary_zZ: false,
          zZ_first_multiplication_factor: [0, 0],
          zZ_second_multiplication_factor: [1, 0],
        }),
      })
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok) {
            messageCalculateRomb.push([server, data.detail]);
            return;
          }
          Rs.push([server, data.secret]);
        })
        .catch((err) => {
          errorCalculateRomb.push([server, err.message]);
        }),
    );

    serverAdresses.map((server) =>
      fetch(`${server}/api/calculate-multiplicative-share`, {
        method: 'PUT',
        headers: {
          'content-type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          set_in_temporary_zZ_index: 0,
          calculate_for_xor: false,
        }),
      })
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok) {
            messageCalculateRomb.push([server, data.detail]);
            return;
          }
          Multishares.push([server, data.secret]);
        })
        .catch((err) => {
          errorCalculateRomb.push([server, err.message]);
        }),
    );

    serverAdresses.map((server) =>
      fetch(`${server}/api/reset-calculation`, {
        method: 'GET',
        headers: {
          'content-type': 'application/json',
          Accept: 'application/json',
        },
      })
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok) {
            messageCalculateRomb.push([server, data.detail]);
            return;
          }
        })
        .catch((err) => {
          errorCalculateRomb.push([server, err.message]);
        }),
    );

    await xor(
      serverAdresses,
      false,
      [0, 0],
      [1, 1],
    );

    Qs = [];
    Rs = [];

    serverAdresses.map((server) =>
      fetch(`${server}/api/redistribute-q`, {
        method: 'GET',
        headers: {
          'content-type': 'application/json',
          Accept: 'application/json',
        },
      })
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok) {
            messageCalculateRomb.push([server, data.detail]);
            return;
          }
          Qs.push([server, data.secret]);
        })
        .catch((err) => {
          errorCalculateRomb.push([server, err.message]);
        }),
    );

    serverAdresses.map((server) =>
      fetch(`${server}/api/redistribute-r`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          take_value_from_temporary_zZ: false,
          zZ_first_multiplication_factor: [0, 0],
          zZ_second_multiplication_factor: [1, 0],
        }),
      })
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok) {
            messageCalculateRomb.push([server, data.detail]);
            return;
          }
          Rs.push([server, data.secret]);
        })
        .catch((err) => {
          errorCalculateRomb.push([server, err.message]);
        }),
    );

    Multishares = [];

    serverAdresses.map((server) =>
      fetch(`${server}/api/calculate-multiplicative-share`, {
        method: 'PUT',
        headers: {
          'content-type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          set_in_temporary_zZ_index: 0,
          calculate_for_xor: false,
        }),
      })
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok) {
            messageCalculateRomb.push([server, data.detail]);
            return;
          }
          Multishares.push([server, data.secret]);
        })
        .catch((err) => {
          errorCalculateRomb.push([server, err.message]);
        }),
    );

    serverAdresses.map((server) =>
      fetch(`${server}/api/reset-calculation`, {
        method: 'GET',
        headers: {
          'content-type': 'application/json',
          Accept: 'application/json',
        },
      })
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok) {
            messageCalculateRomb.push([server, data.detail]);
            return;
          }
        })
        .catch((err) => {
          errorCalculateRomb.push([server, err.message]);
        }),
    );

    await xor(
      serverAdresses,
      true,
      [0, 1],
      [1],
    );


    console.log("działa romb");
  };

  async function calculateFinalComparisonResult(parties, openedA, l, k) {
    // Reset the calculation for parties
    const resetTasks = parties.map((party) =>
      fetch(`${party}/api/reset-calculation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then(async (res) => {
          if (!res.ok) {
            const data = await res.json();
            console.error(`Error resetting ${party}: ${data.detail}`);
          }
        })
        .catch((err) => {
          console.error(`Error resetting ${party}: ${err.message}`);
        })
    );
    await Promise.all(resetTasks);
    console.log("Reset for all parties");
  
    // Calculate and share q for each party
    const qTasks = parties.map((party) =>
      fetch(`${party}/api/redistribute-q`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then(async (res) => {
          if (!res.ok) {
            const data = await res.json();
            console.error(`Error redistributing q for ${party}: ${data.detail}`);
          }
        })
        .catch((err) => {
          console.error(`Error redistributing q for ${party}: ${err.message}`);
        })
    );
    await Promise.all(qTasks);
    console.log("q calculated and shared for all parties");
  
    // Calculate and share r for each party
    const rTasks = parties.map((party) =>
      fetch(`${party}/api/redistribute-r`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          calculate_final_comparison_result: true,
          opened_a: openedA,
          l: l,
          k: k,
        }),
      })
        .then(async (res) => {
          if (!res.ok) {
            const data = await res.json();
            console.error(`Error redistributing r for ${party}: ${data.detail}`);
          }
        })
        .catch((err) => {
          console.error(`Error redistributing r for ${party}: ${err.message}`);
        })
    );
    await Promise.all(rTasks);
    console.log("r calculated and shared for all parties");
  
    // Calculate the multiplicative share for each party
    const multiplicativeShareTasks = parties.map((party) =>
      fetch(`${party}/api/calculate-multiplicative-share`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          calculate_for_xor: true,
        }),
      })
        .then(async (res) => {
          if (!res.ok) {
            const data = await res.json();
            console.error(`Error calculating multiplicative share for ${party}: ${data.detail}`);
          }
        })
        .catch((err) => {
          console.error(`Error calculating multiplicative share for ${party}: ${err.message}`);
        })
    );
    await Promise.all(multiplicativeShareTasks);
    console.log("Multiplicative shares calculated for all parties");
  
    // xor for all parties
    const comparisonResultTasks = parties.map((party) =>
      fetch(`${party}/api/calculate-comparison-result`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          opened_a: openedA,
          l: l,
          k: k,
        }),
      })
        .then(async (res) => {
          if (!res.ok) {
            const data = await res.json();
            console.error(`Error calculating comparison result for ${party}: ${data.detail}`);
          }
        })
        .catch((err) => {
          console.error(`Error calculating comparison result for ${party}: ${err.message}`);
        })
    );
    await Promise.all(comparisonResultTasks);
    console.log("działa liczenie");
  }



  const handleStartAuction = async () => {

    const serverAdresses = getServerAddresses(servers);

    console.log("początek");

    const messageCalculateAComparison: [string, string][] = [];
    const errorCalculateAComparison: [string, string][] = [];
    const messageCalculateSecret: [string, string][] = [];
    const errorCalculateSecret: [string, string][] = [];
    const messageCalculateZs: [string, string][] = [];
    const errorCalculateZs: [string, string][] = [];
    const messageRecalculateAComparison: [string, string][] = [];
    const errorRecalculateAComparison: [string, string][] = [];
    const messagePopZ: [string, string][] = [];
    const errorPopZ: [string, string][] = [];
    const secrets: [string, number][] = [];
    const Zs = []
    const secrets_final: [string, number][] = [];


    const calculateAComparison = serverAdresses.map((server) =>
      fetch(`${server}/api/calculate-a-comparison`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          l: 1000,
          k: 2,            
          first_client_id: 21,
          second_client_id: 37,
        }),
      })
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok) {
            errorCalculateAComparison.push([server, data.detail]);
            return;
          }
          messageCalculateAComparison.push([server, data.result]);
        })
        .catch((err) => {
          errorCalculateAComparison.push([server, err.message]);
        }),
    );
    
    await Promise.all(calculateAComparison);
    console.log("działa calculateAComparison");

    const promisesReconstruct = serverAdresses.map((server) =>
          fetch(`${server}/api/reconstruct-secret`, {
            method: 'GET',
            headers: {
              'content-type': 'application/json',
              Accept: 'application/json',
            },
          })
            .then(async (res) => {
              const data = await res.json();
              if (!res.ok) {
                messageCalculateSecret.push([server, data.detail]);
                return;
              }
              secrets.push([server, data.secret]);
            })
            .catch((err) => {
              errorCalculateSecret.push([server, err.message]);
            }),
        );
      
    await Promise.all(promisesReconstruct);
    console.log("działa promisesReconstruct");

    const calculateZ = serverAdresses.map((server) =>
          fetch(`${server}/api/calculate-z-comparison`, {
            method: 'POST',
            headers: {
              'content-type': 'application/json',
              Accept: 'application/json',
            },
          })
            .then(async (res) => {
              const data = await res.json();
              if (!res.ok) {
                messageCalculateZs.push([server, data.detail]);
                return;
              }
              Zs.push([server, data.secret]);
            })
            .catch((err) => {
              errorCalculateZs.push([server, err.message]);
            }),
        );
      
    await Promise.all(calculateZ);
    console.log(errorCalculateZs);
    console.log("działa calculateZ");

    for (let i = 0; i < 3; i++) {
      await romb(serverAdresses);

      serverAdresses.map((server) =>
        fetch(`${server}/api/pop-zZ`, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            Accept: 'application/json',
          },
        })
          .then(async (res) => {
            const data = await res.json();
            if (!res.ok) {
              errorPopZ.push([server, data.detail]);
              return;
            }
            messagePopZ.push([server, data.result]);
          })
          .catch((err) => {
            errorPopZ.push([server, err.message]);
          }));

    }

    await calculateFinalComparisonResult(serverAdresses, secrets, 1000, 2);
    console.log("działa calculateFinalComparisonResult");

    const recalculateFinalSecrets = serverAdresses.map((server) =>
          fetch(`${server}/api/reconstruct-secret`, {
            method: 'POST',
            headers: {
              'content-type': 'application/json',
              Accept: 'application/json',
            },
          })
            .then(async (res) => {
              const data = await res.json();
              if (!res.ok) {
                errorRecalculateAComparison.push([server, data.detail]);
                return;
              }
              messageRecalculateAComparison.push([server, data.result]);
              secrets_final.push([server, data.secret]);
            })
            .catch((err) => {
              errorRecalculateAComparison.push([server, err.message]);
            }),
        );
        
    await Promise.all(recalculateFinalSecrets);
    console.log("działa recalculateFinalSecrets");
  };


      

    //   const messageQSuccess: [string, string][] = [];
    //   const messageQError: [string, string][] = [];
    
    //   const promises_q = servers.map((server) =>
    //     fetch(`${server}/api/redistribute-q`, {
    //       method: 'POST',
    //       headers: {
    //         'content-type': 'application/json',
    //         Accept: 'application/json',
    //       },
    //     })
    //       .then(async (res) => {
    //         const data = await res.json();
    //         if (!res.ok) {
    //           messageQError.push([server, data.detail]);
    //           return;
    //         }
    //         messageQSuccess.push([server, data.result]);
    //       })
    //       .catch((err) => {
    //         messageQError.push([server, err.message]);
    //       }),
    //   );
      
      
    //   await Promise.all(promises_q);

    //   console.log("po promises q");
      
    //   const messageRSuccess: [string, string][] = [];
    //   const messageRError: [string, string][] = [];
    
    //   const promises_r = servers.map((server) =>
    //     fetch(`${server}/api/redistribute-r`, {
    //       method: 'POST',
    //       headers: {
    //         'content-type': 'application/json',
    //         Accept: 'application/json',
    //       },
    //       body: JSON.stringify({
    //         first_client_id: firstClientId,
    //         second_client_id: secondClientId,
    //       }),
    //     })
    //       .then(async (res) => {
    //         const data = await res.json();
    //         if (!res.ok) {
    //           messageRError.push([server, data.detail]);
    //           return;
    //         }
    //         messageRSuccess.push([server, data.result]);
    //       })
    //       .catch((err) => {
    //         messageQError.push([server, err.message]);
    //       }),
    //   );
    
    //   await Promise.all(promises_r);

      
    //   console.log("po promises r");
        
    //   const messageSuccessCalculateShare: [string, string][] = [];
    //   const messageErrorCalculateShare: [string, string][] = [];
    
    //   const promises = servers.map((server) =>
    //     fetch(`${server}/api/calculate-multiplicative-share`, {
    //       method: 'PUT',
    //       headers: {
    //         'content-type': 'application/json',
    //         Accept: 'application/json',
    //       },
    //     })
    //       .then(async (res) => {
    //         const data = await res.json();
    //         if (!res.ok) {
    //           messageErrorCalculateShare.push([server, data.detail]);
    //           return;
    //         }
    //         messageSuccessCalculateShare.push([server, data.result]);
    //       })
    //       .catch((err) => {
    //         messageErrorCalculateShare.push([server, err.message]);
    //       }),
    //   );
    
    //   await Promise.all(promises);

      
    //   console.log("po calculate-multiplicative-share");
    
    //   const secrets: [string, number][] = [];
    //   const messageErrorReconstruct: [string, number][] = [];
    
    //   const promisesReconstruct = servers.map((server) =>
    //     fetch(`${server}/api/reconstruct-secret`, {
    //       method: 'GET',
    //       headers: {
    //         'content-type': 'application/json',
    //         Accept: 'application/json',
    //       },
    //     })
    //       .then(async (res) => {
    //         const data = await res.json();
    //         if (!res.ok) {
    //           messageErrorReconstruct.push([server, data.detail]);
    //           return;
    //         }
    //         secrets.push([server, data.secret]);
    //       })
    //       .catch((err) => {
    //         messageErrorReconstruct.push([server, err.message]);
    //       }),
    //   );
    
    //   await Promise.all(promisesReconstruct);
      
    //   console.log("koniec");

    //   console.log(secrets);
    
    //   return secrets;
    // };

    // console.log("zaczynamy");
    // const secrets = handleMultiplication(21, 37, serverAdresses);
    // console.log(secrets);


/*
   const handleMultiplication = async (
    firstClientId: number,
    secondClientId: number,
    servers: string[],
  ): Promise<[string, number][]> => {
    const messageQSuccess: [string, string][] = [];
    const messageQError: [string, string][] = [];
  
    const promises_q = servers.map((server) =>
      fetch(`${server}/api/redistribute-q`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          Accept: 'application/json',
        },
      })
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok) {
            messageQError.push([server, data.detail]);
            return;
          }
          messageQSuccess.push([server, data.result]);
        })
        .catch((err) => {
          messageQError.push([server, err.message]);
        }),
    );
  
    await Promise.all(promises_q);
  
    if (messageQError.length !== 0) {
      toast.error(
        <div>
          {messageQError.map(([server, result]) => (
            <p key={server}>
              <span className='font-bold'>{server}</span>: {result}
            </p>
          ))}
        </div>,
      );
    }
  
    if (messageQSuccess.length !== 0) {
      toast.success(
        <div>
          {messageQSuccess.map(([server, result]) => (
            <p key={server}>
              <span className='font-bold'>{server}</span>: {result}
            </p>
          ))}
        </div>,
      );
    }
  
    const messageRSuccess: [string, string][] = [];
    const messageRError: [string, string][] = [];
  
    const promises_r = servers.map((server) =>
      fetch(`${server}/api/redistribute-r`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          first_client_id: firstClientId,
          second_client_id: secondClientId,
        }),
      })
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok) {
            messageRError.push([server, data.detail]);
            return;
          }
          messageRSuccess.push([server, data.result]);
        })
        .catch((err) => {
          messageQError.push([server, err.message]);
        }),
    );
  
    await Promise.all(promises_r);
  
    if (messageRError.length !== 0) {
      toast.error(
        <div>
          {messageRError.map(([server, result]) => (
            <p key={server}>
              <span className='font-bold'>{server}</span>: {result}
            </p>
          ))}
        </div>,
      );
    }
  
    if (messageRSuccess.length !== 0) {
      toast.success(
        <div>
          {messageRSuccess.map(([server, result]) => (
            <p key={server}>
              <span className='font-bold'>{server}</span>: {result}
            </p>
          ))}
        </div>,
      );
    }
  
    const messageSuccessCalculateShare: [string, string][] = [];
    const messageErrorCalculateShare: [string, string][] = [];
  
    const promises = servers.map((server) =>
      fetch(`${server}/api/calculate-multiplicative-share`, {
        method: 'PUT',
        headers: {
          'content-type': 'application/json',
          Accept: 'application/json',
        },
      })
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok) {
            messageErrorCalculateShare.push([server, data.detail]);
            return;
          }
          messageSuccessCalculateShare.push([server, data.result]);
        })
        .catch((err) => {
          messageErrorCalculateShare.push([server, err.message]);
        }),
    );
  
    await Promise.all(promises);
  
    if (messageErrorCalculateShare.length !== 0) {
      toast.error(
        <div>
          {messageErrorCalculateShare.map(([server, result]) => (
            <p key={server}>
              <span className='font-bold'>{server}</span>: {result}
            </p>
          ))}
        </div>,
      );
    }
  
    if (messageSuccessCalculateShare.length !== 0) {
      toast.success(
        <div>
          {messageSuccessCalculateShare.map(([server, result]) => (
            <p key={server}>
              <span className='font-bold'>{server}</span>: {result}
            </p>
          ))}
        </div>,
      );
    }
    const secrets: [string, number][] = [];
    const messageErrorReconstruct: [string, number][] = [];
  
    const promisesReconstruct = servers.map((server) =>
      fetch(`${server}/api/reconstruct-secret`, {
        method: 'GET',
        headers: {
          'content-type': 'application/json',
          Accept: 'application/json',
        },
      })
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok) {
            messageErrorReconstruct.push([server, data.detail]);
            return;
          }
          secrets.push([server, data.secret]);
        })
        .catch((err) => {
          messageErrorReconstruct.push([server, err.message]);
        }),
    );
  
    await Promise.all(promisesReconstruct);
  
    if (messageErrorReconstruct.length !== 0) {
      toast.error(
        <div>
          {messageErrorReconstruct.map(([server, result]) => (
            <p key={server}>
              <span className='font-bold'>{server}</span>: {result}
            </p>
          ))}
        </div>,
      );
    }
  
    return secrets;
  };
*/
  return (
    <>
      <Navbar isLogged />
      <main className='container py-6'>
        <div className='flex flex-col gap-6 items-start lg:flex-row'>
          <div className='w-full flex flex-col gap-6 lg:w-1/2'>
            <BidServerPanel
              headline='Add new server'
              description='Add a new server to the auction network'
              firstValue={serverName}
              setFirstValue={setServerName}
              secondValue={serverAddress}
              setSecondValue={setServerAddress}
              onSubmit={handleAddServer}
              isDisabled={!serverName && !serverAddress}
              isAdmin
            />
             <BidServerPanel
              headline='Set initial values'
              description='Set the initial values for the auction'
              firstValue={t}
              setFirstValue={setT}
              secondValue={n}
              setSecondValue={setN}
              onSubmit={sendInitialDataWithServers}
              isDisabled={!t && !n}
              initialValues
              isAdmin
            />
          </div>
          <div className='w-full flex flex-col gap-6 lg:w-1/2'>
            <div className='w-full bg-secondary border border-primary-border p-6 rounded-xl shadow-sm'>
              <h2 className='text-xl font-bold tracking-wide font-headline lg:text-2xl'>
                Action buttons
              </h2>
              <p className='text-sm md:text-base'>Set of available actions</p>
              <div className='pt-6'>
                <ul className='w-full flex flex-col justify-between items-center gap-4 min-[440px]:flex-row lg:justify-start'>
                  <li className='w-full lg:w-fit'>
                    <Button
                      style='w-full flex gap-2 justify-center items-center'
                      variant='default'
                      onClick={handleStartAuction}
                    >
                      Start auction
                      <MdGavel className='h-4 w-4' />
                    </Button>
                  </li>
                  <li className='w-full lg:w-fit'>
                    <Button
                      style='w-full flex gap-2 justify-center items-center'
                      variant='outline'
                      onClick={() =>
                        hardReset(
                          getServerAddresses(servers),
                          handleClearDataFirstStep,
                          handleClearDataSecondStep,
                        )
                      }
                    >
                      Factory reset
                      <MdRestore className='h-4 w-4' />
                    </Button>
                  </li>
                </ul>
              </div>
            </div>
            <div className='w-full bg-secondary border border-primary-border p-6 rounded-xl shadow-sm'>
              <h2 className='text-xl font-bold tracking-wide font-headline lg:text-2xl'>
                Server Status
              </h2>
              <p className='text-sm md:text-base'>
                Overview of all connected auction servers
              </p>
              <div className='pt-6'>
                <div className='w-full flex justify-between items-end gap-4'>
                  <table>
                    <thead>
                      <tr className='flex justify-around rounded-t-xl bg-emerald-100'>
                        <th className='basis-3/10 sm:basis-2/10'>Name</th>
                        <th className='basis-3/10 sm:basis-5/10'>Address</th>
                        <th className='basis-2/10 sm:basis-2/10'>Status</th>
                        <th className='basis-2/10 sm:basis-1/10'>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {servers.map((server) => (
                        <tr key={server.id} className='flex items-center'>
                          <td className='basis-3/10 sm:basis-2/10'>
                            {server.name}
                          </td>
                          <td className='basis-3/10 sm:basis-5/10'>
                            {server.address}
                          </td>
                          <td className='basis-2/10 sm:basis-2/10'>
                            <div
                              className={`w-min mx-auto rounded-full px-2 py-1 text-xs lg:text-sm lg:px-3 lg:py-1.5 ${
                                server.status === 'online'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {server.status}
                            </div>
                          </td>
                          <td className='basis-2/10 flex justify-center sm:basis-1/10'>
                            <Button
                              variant='ghost'
                              onClick={() => handleRemoveServer(server.id)}
                            >
                              <MdOutlineDelete className='h-4 w-4' />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )};