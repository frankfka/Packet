import debug from 'debug';
import React, { useContext } from 'react';
import { IPFS } from 'ipfs-core-types';
import { createContext, useEffect, useState } from 'react';
import { createIpfs, stopIpfs } from './ipfsLifecycle';

type IpfsContextData = {
  ipfs?: IPFS;
  initError?: boolean;
};

export const IpfsContext = createContext<IpfsContextData>({});

export const IpfsContextProvider: React.FC = ({ children }) => {
  const [ipfs, setIpfs] = useState<IPFS>();
  const [initError, setInitError] = useState(false);

  // Create IPFS instance on load
  useEffect(() => {
    if (ipfs) {
      return;
    }

    createIpfs()
      .then((instance) => setIpfs(instance))
      .catch((err) => {
        console.error('Error creating IPFS instance', err);
        setInitError(true);
      });

    return () => ipfs && stopIpfs(ipfs);
  }, [ipfs]);

  // Debug logging
  useEffect(() => {
    const debugLog = async () => {
      if (ipfs == null) {
        return;
      }

      const peers = await ipfs.swarm.peers();
      const currentNode = await ipfs.id();

      console.debug('[IPFS] Number of peers:', peers.length);
      console.debug('[IPFS] Current node ID:', currentNode.id);
      console.debug('[IPFS] Current node addresses:', currentNode.addresses);
    };

    const interval = setInterval(debugLog, 30000);
    debugLog();

    return () => clearInterval(interval);
  }, [ipfs]);

  const contextData: IpfsContextData = {
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
