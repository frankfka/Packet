import OrbitDB from 'orbit-db';
import KeyValueStore from 'orbit-db-kvstore';
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import getLogger from '../../../../util/getLogger';
import { useOrbitDb } from '../orbitDbContext';
import { createKvStore, GetKvStoreParams } from './keyValue/kvStoreUtils';
import { getStoreAddress } from './orbitDbStoreUtils';

const logger = getLogger('StoreCache-Context');

type StoreCacheContextData = {
  getKvStore<TValueType>(
    params: GetKvStoreParams
  ): Promise<KeyValueStore<TValueType>>;
  removeKvStore(address: string): Promise<void>;
};

export const StoreCacheContext = createContext<StoreCacheContextData | null>(
  null
);

export const StoreCacheContextProvider: React.FC = ({ children }) => {
  const { orbitDb } = useOrbitDb();
  const kvStoreCache = useRef<Record<string, KeyValueStore<unknown>>>({});

  // Reset the store cache when we change the root OrbitDB instance
  useEffect(() => {
    kvStoreCache.current = {};
  }, [orbitDb]);

  const getKvStore = async <TValueType extends {}>(
    params: GetKvStoreParams
  ): Promise<KeyValueStore<TValueType>> => {
    if (orbitDb == null) {
      throw Error('OrbitDB instance is not defined');
    }

    const storeAddress = await getStoreAddress(orbitDb, 'keyvalue', params);
    const cachedStore = kvStoreCache.current[
      storeAddress
    ] as KeyValueStore<TValueType>;

    if (cachedStore) {
      logger.debug('Returning cached KV store for address', storeAddress);
      return cachedStore;
    }

    logger.debug('Creating new KV store for address', storeAddress);
    // No store exists, create a new one and set it to cache
    const store = await createKvStore<TValueType>(orbitDb, params);
    kvStoreCache.current[storeAddress] = store;

    return store;
  };

  const removeKvStore = async (address: string): Promise<void> => {
    logger.debug('Removing KV store from cache with address', address);
    const store = kvStoreCache.current[address];
    if (store) {
      await store.close();
      delete kvStoreCache.current[address];
    }
  };

  const contextData: StoreCacheContextData = {
    getKvStore,
    removeKvStore,
  };

  return (
    <StoreCacheContext.Provider value={orbitDb ? contextData : null}>
      {children}
    </StoreCacheContext.Provider>
  );
};

export const useStoreCache = () => useContext(StoreCacheContext);
