'use client';

import { useState } from 'react';
import ServerSetup from '../components/serverSetup';
import SecondStep from '../components/secondStep';
import Navbar from '@/components/ui/navbar';
import { ToastContainer } from 'react-toastify';

export default function Home() {
  const [t, setT] = useState<number>(0);
  const [n, setN] = useState<number>(0);
  const [servers, setServers] = useState<string[]>([]);
  const [firstStep, setFirstStep] = useState<boolean>(true);

  const [initialValuesServer, setInitialValuesServer] = useState<string>('');
  const [currentServer, setCurrentServer] = useState<string>('');

  const [id, setId] = useState<number>(0);
  const [secret, setSecret] = useState<number>(0);
  const [reconstructedSecret, setReconstructedSecret] = useState<
    [string, number][]
  >([]);
  const [firstClientId, setFirstClientId] = useState<number>(0);
  const [secondClientId, setSecondClientId] = useState<number>(0);
  const [
    isRAndQCalculatedAndRedistributed,
    seItsRAndQCalculatedAndRedistributed,
  ] = useState<boolean>(false);
  const [isMultiplicativeShareCalculated, setIsMultiplicativeShareCalculated] =
    useState<boolean>(false);
  const [isSecretReconstructed, setIsSecretReconstructed] =
    useState<boolean>(false);

  const handleClearDataFirstStep = () => {
    setT(0);
    setN(0);
    setServers([]);
    setInitialValuesServer('');
    setCurrentServer('');
  };

  const handleClearDataSecondStep = () => {
    setId(0);
    setSecret(0);
    setReconstructedSecret([]);
    setFirstClientId(0);
    setSecondClientId(0);
    seItsRAndQCalculatedAndRedistributed(false);
    setIsMultiplicativeShareCalculated(false);
    setIsSecretReconstructed(false);
  };
  const [allowNavigation, setAllowNavigation] = useState<boolean>(false);

  return (
    <>
      <Navbar
        servers={servers}
        setFirstStep={setFirstStep}
        setAllowNavigation={setAllowNavigation}
        handleClearDataFirstStep={handleClearDataFirstStep}
        handleClearDataSecondStep={handleClearDataSecondStep}
      />
      <div className='w-full h-full flex flex-col items-center justify-center'>
        <div className='w-1/2'>
          {firstStep ? (
            <ServerSetup
              t={t}
              setT={setT}
              n={n}
              initialValuesServer={initialValuesServer}
              currentServer={currentServer}
              allowNavigation={allowNavigation}
              setN={setN}
              servers={servers}
              setAllowNavigation={setAllowNavigation}
              setServers={setServers}
              setInitialValuesServer={setInitialValuesServer}
              setCurrentServer={setCurrentServer}
              setFirstStep={setFirstStep}
            />
          ) : (
            <SecondStep
              t={t}
              n={n}
              id={id}
              secret={secret}
              reconstructedSecret={reconstructedSecret}
              firstClientId={firstClientId}
              secondClientId={secondClientId}
              isRAndQCalculatedAndRedistributed={
                isRAndQCalculatedAndRedistributed
              }
              isMultiplicativeShareCalculated={isMultiplicativeShareCalculated}
              isSecretReconstructed={isSecretReconstructed}
              servers={servers}
              setId={setId}
              setSecret={setSecret}
              setReconstructedSecret={setReconstructedSecret}
              setFirstClientId={setFirstClientId}
              setSecondClientId={setSecondClientId}
              seItsRAndQCalculatedAndRedistributed={
                seItsRAndQCalculatedAndRedistributed
              }
              setIsMultiplicativeShareCalculated={
                setIsMultiplicativeShareCalculated
              }
              setIsSecretReconstructed={setIsSecretReconstructed}
              setFirstStep={setFirstStep}
            />
          )}
        </div>
      </div>
      <ToastContainer />
    </>
  );
}
