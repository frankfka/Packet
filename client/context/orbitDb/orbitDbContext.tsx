import OrbitDB from 'orbit-db';
import { Identity } from 'orbit-db-identity-provider';
import React, { createContext, useContext, useEffect, useState } from 'react';
import getLogger from '../../../util/getLogger';
import { createOrbitDbInstance } from '../../util/orbitDb/orbitDbUtils';
import { useIpfs } from '../ipfs/IpfsContext';

const logger = getLogger('OrbitDB-Context');

type OrbitDbContextData = {
  isLoading: boolean;
  identity?: Identity;
  setIdentity(identity?: Identity): void;
  orbitDb?: OrbitDB;
  initError?: boolean;
};

export const OrbitDbContext = createContext<OrbitDbContextData>({
  isLoading: false,
  setIdentity() {},
});

export const OrbitDbContextProvider: React.FC = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [identity, setIdentity] = useState<Identity>();
  const [orbitDb, setOrbitDb] = useState<OrbitDB>();
  const [initError, setInitError] = useState(false);

  const {
    ipfs,
    isLoading: isLoadingIpfs,
    initError: ipfsInitError,
  } = useIpfs();

  // Create the DB when able
  useEffect(() => {
    // Enable cancellation of existing operation
    let cancelled = false;

    // Async function to create an OrbitDB instance
    const createOrbitDb = async () => {
      // Reset all state
      setOrbitDb(undefined);
      setInitError(false);

      if (ipfs == null || isLoadingIpfs) {
        return;
      }

      // Start loading
      setIsLoading(true);

      try {
        const db = await createOrbitDbInstance(ipfs, identity);

        // Abort if the request has been cancelled
        if (cancelled) {
          logger.debug('Existing request is cancelled, aborting.');
          return;
        }

        logger.debug('Created OrbitDB instance', db);
        setOrbitDb(db);
      } catch (err) {
        logger.debug('Error creating OrbitDB', err);
        if (cancelled) return;
        setInitError(true);
      }

      // Stop loading
      setIsLoading(false);
    };

    // Call the async fn
    createOrbitDb();
  }, [ipfs, identity, isLoadingIpfs]);

  // Debug logging
  useEffect(() => {
    const debugLog = async () => {
      if (orbitDb == null) {
        return;
      }

      logger.debug('Instance:', orbitDb);
      logger.debug('OrbitDB ID', orbitDb?.id);
      // @ts-ignore
      logger.debug('Current identity ID', orbitDb.identity._id);
    };

    const interval = setInterval(debugLog, 30000);
    debugLog();

    return () => clearInterval(interval);
  }, [orbitDb]);

  // Create context data
  const contextData: OrbitDbContextData = {
    isLoading: isLoadingIpfs || isLoading,
    orbitDb,
    initError: initError || ipfsInitError,
    identity,
    setIdentity,
  };

  return (
    <OrbitDbContext.Provider value={contextData}>
      {children}
    </OrbitDbContext.Provider>
  );
};

export const useOrbitDb = () => useContext(OrbitDbContext);
