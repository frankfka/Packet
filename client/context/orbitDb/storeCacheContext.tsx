import OrbitDB from 'orbit-db';
import FeedStore from 'orbit-db-feedstore';
import KeyValueStore from 'orbit-db-kvstore';
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import getLogger from '../../../util/getLogger';
import {
  createFeedStore,
  GetFeedStoreParams,
} from '../../util/orbitDb/orbitDbFeedStoreUtils';
import { useOrbitDb } from './orbitDbContext';
import {
  createKvStore,
  GetKvStoreParams,
} from '../../util/orbitDb/orbitDbKvStoreUtils';
import { getStoreAddress } from '../../util/orbitDb/orbitDbStoreUtils';

const logger = getLogger('StoreCache-Context');

type StoreCacheContextData = {
  // OrbitDB KV Store
  getKvStore<TValueType>(
    params: GetKvStoreParams
  ): Promise<KeyValueStore<TValueType>>;
  removeKvStore(address: string): Promise<void>;
  // OrbitDB Feed store
  getFeedStore<TValueType>(
    params: GetKvStoreParams
  ): Promise<FeedStore<TValueType>>;
  removeFeedStore(address: string): Promise<void>;
};

export const StoreCacheContext = createContext<StoreCacheContextData | null>(
  null
);

// TODO: Combine feed and kv
export const StoreCacheContextProvider: React.FC = ({ children }) => {
  const { orbitDb } = useOrbitDb();
  const storeCache = useRef<
    Record<string, KeyValueStore<unknown> | FeedStore<unknown>>
  >({});

  // Reset the store cache when we change the root OrbitDB instance
  useEffect(() => {
    storeCache.current = {};
  }, [orbitDb]);

  const getKvStore = async <TValueType extends {}>(
    params: GetKvStoreParams
  ): Promise<KeyValueStore<TValueType>> => {
    if (orbitDb == null) {
      throw Error('OrbitDB instance is not defined');
    }

    const storeAddress = await getStoreAddress(orbitDb, 'keyvalue', params);
    const cachedStore = storeCache.current[
      storeAddress
    ] as KeyValueStore<TValueType>;

    if (cachedStore) {
      logger.debug('Returning cached KV store for address', storeAddress);
      return cachedStore;
    }

    logger.debug(
      'Loading new KV store in cache for address',
      storeAddress,
      'Params',
      params
    );
    // No store exists, create a new one and set it to cache
    const store = await createKvStore<TValueType>(orbitDb, params);
    storeCache.current[storeAddress] = store;

    return store;
  };

  const removeKvStore = async (address: string): Promise<void> => {
    logger.debug('Removing KV store from cache with address', address);
    const store = storeCache.current[address];
    if (store) {
      await store.close();
      delete storeCache.current[address];
    }
  };

  const getFeedStore = async <TValueType extends {}>(
    params: GetFeedStoreParams
  ): Promise<FeedStore<TValueType>> => {
    if (orbitDb == null) {
      throw Error('OrbitDB instance is not defined');
    }

    const storeAddress = await getStoreAddress(orbitDb, 'feed', params);
    const cachedStore = storeCache.current[
      storeAddress
    ] as FeedStore<TValueType>;

    if (cachedStore) {
      logger.debug('Returning cached feed store for address', storeAddress);
      return cachedStore;
    }

    logger.debug(
      'Loading new feed store in cache for address',
      storeAddress,
      'Params',
      params
    );
    // No store exists, create a new one and set it to cache
    const store = await createFeedStore<TValueType>(orbitDb, params);
    storeCache.current[storeAddress] = store;

    return store;
  };

  const removeFeedStore = async (address: string): Promise<void> => {
    logger.debug('Removing feed store from cache with address', address);
    const store = storeCache.current[address];
    if (store) {
      await store.close();
      delete storeCache.current[address];
    }
  };

  const contextData: StoreCacheContextData = {
    getKvStore,
    removeKvStore,
    getFeedStore,
    removeFeedStore,
  };

  return (
    <StoreCacheContext.Provider value={orbitDb ? contextData : null}>
      {children}
    </StoreCacheContext.Provider>
  );
};

export const useStoreCache = () => useContext(StoreCacheContext);
