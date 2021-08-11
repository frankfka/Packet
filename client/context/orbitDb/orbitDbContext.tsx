import OrbitDB from 'orbit-db';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useIpfs } from '../ipfs/IpfsContext';
import { createOrbitDbInstance } from './orbitDbLifecycle';

type OrbitDbContextData = {
  orbitDb?: OrbitDB;
  initError?: boolean;
};

export const OrbitDbContext = createContext<OrbitDbContextData>({});

export const OrbitDbContextProvider: React.FC = ({ children }) => {
  const [orbitDb, setOrbitDb] = useState<OrbitDB>();
  const [initError, setInitError] = useState(false);

  const { ipfs, initError: ipfsInitError } = useIpfs();

  // Create the DB when able
  useEffect(() => {
    if (ipfs == null) {
      return;
    }

    createOrbitDbInstance(ipfs)
      .then((db) => {
        setOrbitDb(db);
      })
      .catch((err) => {
        console.error('Error creating orbitDB', err);
        setInitError(true);
      });
  }, [ipfs]);

  // Debug logging
  useEffect(() => {
    const debugLog = async () => {
      if (orbitDb == null) {
        return;
      }

      console.debug('[OrbitDB] Instance:', orbitDb);
    };

    const interval = setInterval(debugLog, 30000);
    debugLog();

    return () => clearInterval(interval);
  }, [orbitDb]);

  const contextData: OrbitDbContextData = {
    orbitDb,
    initError: initError || ipfsInitError,
  };

  return (
    <OrbitDbContext.Provider value={contextData}>
      {children}
    </OrbitDbContext.Provider>
  );
};

export const useOrbitDb = () => useContext(OrbitDbContext);
