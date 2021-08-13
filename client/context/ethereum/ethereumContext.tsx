import {
  JsonRpcSigner,
  Provider,
  Web3Provider,
} from '@ethersproject/providers';
import { ethers } from 'ethers';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import getLogger from '../../../util/getLogger';
import { EthereumSigner } from './ethereumTypes';

const logger = getLogger('Ethereum-Context');

// If provider is available but current signer is undefined, this indicates
// that user needs to grant access to accounts
type EthereumContextData = {
  providerAvailable?: boolean; // Whether the user has a window.ethereum instance
  init(): Promise<JsonRpcSigner | undefined>; // Attempts to initialize the current signer, returning a signer address if possible
  currentSigner?: JsonRpcSigner; // A VALID signer guaranteed to have an address
};

export const EthereumContext = createContext<EthereumContextData>({
  async init() {
    return undefined;
  },
});

export const EthereumContextProvider: React.FC = ({ children }) => {
  const [providerAvailable, setProviderAvailable] = useState(false);
  const [ethersProvider, setEthersProvider] = useState<Web3Provider>();
  const [currentSigner, setCurrentSigner] = useState<EthereumSigner>();

  // Updates current signer in response to events and returns valid signer if able
  const updateSigner = async (
    provider: Web3Provider,
    addresses?: unknown[]
  ): Promise<JsonRpcSigner | undefined> => {
    setCurrentSigner(undefined);
    logger.debug('Updating signer');

    if (window.ethereum == null || provider == null) {
      logger.debug('No provider, skipping updating signer');
      return;
    }

    if (addresses != null && addresses.length === 0) {
      // Ethereum update accounts method - no linked addresses, so return
      logger.debug('No addresses, skipping updating signer');
      return;
    }

    const signer = provider.getSigner(); // Use current account
    try {
      const address = await signer.getAddress(); // Valid signers have an address
      logger.debug('Signer retrieved with address', address);

      setCurrentSigner(signer);

      return signer;
    } catch (err) {
      logger.error('No address for current signer', err);
    }
  };

  // Check for window.ethereum on load
  useEffect(() => {
    setProviderAvailable(window.ethereum != null);
  }, []);

  // Start listening to events on load
  useEffect(() => {
    if (window.ethereum == null || ethersProvider == null) return;

    logger.debug('Initializing accounts changed listener');
    window.ethereum.on('accountsChanged', (addresses) => {
      updateSigner(ethersProvider, addresses);
    });

    return () => {
      logger.debug('Cleaning up listeners');
      window.ethereum?.removeAllListeners();
    };
  }, [ethersProvider]);

  // Init function - returns the initialized signer address
  const init = useCallback(async (): Promise<JsonRpcSigner | undefined> => {
    setCurrentSigner(undefined);

    if (window.ethereum == null) return;

    logger.debug('Initializing Ethereum provider');

    try {
      // Initialize accounts
      await window.ethereum.request?.({ method: 'eth_requestAccounts' });

      logger.debug('Ethereum account access granted');

      // Create ethers provider
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      setEthersProvider(provider);

      // Update current signer
      return updateSigner(provider);
    } catch (err) {
      logger.error('Error requesting accounts', err);
    }
  }, []);

  const contextData = {
    providerAvailable,
    currentSigner,
    init,
  };

  return (
    <EthereumContext.Provider value={contextData}>
      {children}
    </EthereumContext.Provider>
  );
};

export const useEthereumContext = () => useContext(EthereumContext);
