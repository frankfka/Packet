import Store from 'orbit-db-store';
import React, { createContext, useContext, useEffect, useRef } from 'react';
import getLogger from '../../../util/getLogger';
import {
  createOrbitDbStore,
  getStoreAddress,
} from '../../util/orbitDb/orbitDbStoreUtils';
import { GetOrbitDbStoreParams } from '../../util/orbitDb/OrbitDbTypes';
import { useOrbitDb } from './orbitDbContext';

const logger = getLogger('StoreCache-Context');

type StoreCacheContextData = {
  isLoading: boolean;
  getStore<TStoreType extends Store>(
    params: GetOrbitDbStoreParams
  ): Promise<TStoreType>;
  removeStore(store: Store): Promise<void>;
};

export const StoreCacheContext = createContext<StoreCacheContextData>(
  {} as unknown as StoreCacheContextData
);

export const StoreCacheContextProvider: React.FC = ({ children }) => {
  const { orbitDb, isLoading: isLoadingOrbitDb } = useOrbitDb();
  const storeCache = useRef<Record<string, Store>>({});

  // Reset the store cache when we change the root OrbitDB instance
  useEffect(() => {
    storeCache.current = {};
  }, [orbitDb]);

  const getStore = async <TStoreType extends Store>(
    params: GetOrbitDbStoreParams
  ) => {
    if (orbitDb == null) {
      throw Error('OrbitDB instance is not defined');
    }

    const storeAddress = await getStoreAddress(orbitDb, params);
    const cachedStore = storeCache.current[storeAddress] as TStoreType;

    if (cachedStore) {
      logger.debug('Returning cached store for address', storeAddress);
      return cachedStore;
    }

    logger.info(
      'Loading new store in cache for address',
      storeAddress,
      'Params',
      params
    );
    // No store exists, create a new one and set it to cache
    const store = await createOrbitDbStore<TStoreType>(orbitDb, params);
    storeCache.current[storeAddress] = store;

    return store;
  };

  const removeStore = async (store: Store): Promise<void> => {
    logger.debug(
      'Removing KV store from cache with address',
      store.address.toString()
    );
    store.events.removeAllListeners();
    await store.close();
    delete storeCache.current[store.address.toString()];
  };

  const contextData: StoreCacheContextData = {
    isLoading: orbitDb == null || isLoadingOrbitDb,
    getStore,
    removeStore,
  };

  return (
    <StoreCacheContext.Provider value={contextData}>
      {children}
    </StoreCacheContext.Provider>
  );
};

export const useStoreCache = () => useContext(StoreCacheContext);
