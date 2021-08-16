import { IPFS } from 'ipfs-core-types';
import React, { createContext, useContext, useEffect, useState } from 'react';
import getLogger from '../../../util/getLogger';
import { createIpfs, stopIpfs } from './ipfsUtils';

const logger = getLogger('IPFS-Context');

type IpfsContextData = {
  isLoading: boolean;
  ipfs?: IPFS;
  initError?: boolean;
};

export const IpfsContext = createContext<IpfsContextData>({
  isLoading: false,
});

export const IpfsContextProvider: React.FC = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [ipfs, setIpfs] = useState<IPFS>();
  const [initError, setInitError] = useState(false);

  // Create IPFS instance on load
  useEffect(() => {
    let cancelled = false;

    const createIpfsInstance = async () => {
      if (ipfs) {
        return;
      }

      // Reset
      setInitError(false);
      setIpfs(undefined);

      // Start loading
      setIsLoading(true);

      try {
        const instance = await createIpfs();
        if (cancelled) return;

        logger.debug('Created IPFS instance', instance);
        setIpfs(instance);
      } catch (err) {
        logger.debug('Error creating IPFS instance', err);
        if (cancelled) return;
        setInitError(true);
      }

      // Stop loading
      setIsLoading(false);
    };

    createIpfsInstance();

    return () => {
      ipfs && stopIpfs(ipfs);
      cancelled = true;
    };
  }, [ipfs]);

  // Debug logging
  useEffect(() => {
    const debugLog = async () => {
      if (ipfs == null) {
        return;
      }

      const peers = await ipfs.swarm.peers();
      const currentNode = await ipfs.id();

      logger.debug('Number of peers:', peers.length);
      logger.debug('Current node ID:', currentNode.id);
      logger.debug('Current node addresses:', currentNode.addresses);
    };

    const interval = setInterval(debugLog, 30000);
    debugLog();

    return () => clearInterval(interval);
  }, [ipfs]);

  const contextData: IpfsContextData = {
    isLoading,
    ipfs,
    initError,
  };

  return (
    <IpfsContext.Provider value={contextData}>{children}</IpfsContext.Provider>
  );
};

export const useIpfs = () => {
  return useContext(IpfsContext);
};
