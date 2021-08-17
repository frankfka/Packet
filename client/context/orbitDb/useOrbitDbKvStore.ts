import KeyValueStore from 'orbit-db-kvstore';
import { useEffect, useState } from 'react';
import getLogger from '../../../util/getLogger';
import {
  initOrbitDbStoreListeners,
  removeOrbitDbStoreListeners,
} from '../../util/orbitDb/orbitDbStoreUtils';
import {
  GetOrbitDbStoreParams,
  OrbitKvStoreData,
} from '../../util/orbitDb/OrbitDbTypes';
import { useStoreCache } from './storeCacheContext';

export const logger = getLogger('UseOrbitDBKvStore');

// Exposes KNOWN kv data types
export type KvStoreData<TData> = TData & OrbitKvStoreData<unknown>;

export type KvStoreState<TData> = {
  isLoadingStore: boolean;
  store?: KeyValueStore<unknown>;
  storeData?: KvStoreData<TData>;
  reloadStoreData(): void;
  initError?: boolean;
};

export const useOrbitDbKvStore = <TData>(
  // Optional params so that we don't need to create the store when creating the hook
  params?: Omit<GetOrbitDbStoreParams, 'type'>
): KvStoreState<TData> => {
  const storeCacheContext = useStoreCache();

  const [isLoadingStore, setIsLoadingStore] = useState(false);
  const [kvStore, setKvStore] = useState<KeyValueStore<unknown>>();
  const [kvStoreData, setKvStoreData] = useState<KvStoreData<TData>>();
  const [storeInitError, setStoreInitError] = useState(false);

  // Resets state of the hook
  const resetState = () => {
    setIsLoadingStore(false);
    setKvStoreData(undefined);
    setKvStore(undefined);
    setStoreInitError(false);
  };

  // Manually reloads all the data in the store
  const reloadStoreDataForStore = async (store?: KeyValueStore<unknown>) => {
    logger.debug('Reloading store data');

    if (store) {
      await store.load();

      // Use spread operator to create a new object as `kvStore.all`
      // is the same reference between loads
      // @ts-ignore - Ignore to disable typechecking of store types
      setKvStoreData({ ...store.all });
    } else {
      setKvStoreData(undefined);
    }
  };

  const reloadStoreData = async () => {
    reloadStoreDataForStore(kvStore);
  };

  // Create the KV store
  useEffect(() => {
    // Reset all state
    resetState();

    if (storeCacheContext.isLoading || params == null) return;

    let storeInstance: KeyValueStore<unknown> | undefined = undefined;
    let cancelled = false;

    const getStore = async () => {
      logger.debug('Getting store with params', params);

      setIsLoadingStore(true);
      try {
        storeInstance = await storeCacheContext.getStore<
          KeyValueStore<unknown>
        >({
          ...params,
          type: 'keyvalue',
        });

        if (cancelled) return;

        logger.debug('Retrieved KV store', storeInstance);

        // Setup listeners
        initOrbitDbStoreListeners(storeInstance, {
          replicated: (address) => {
            logger.info('db.events.replicated', address.toString());
            reloadStoreDataForStore(storeInstance);
          },
          write: (address, entry) => {
            logger.debug('db.events.write', address.toString(), 'Entry', entry);
            reloadStoreDataForStore(storeInstance);
          },
          peer: (address) => {
            logger.info('db.events.peer', address);
          },
        });

        setKvStore(storeInstance);
      } catch (err) {
        logger.error('Error getting KV store', err);

        if (cancelled) return;

        setStoreInitError(true);
      }
      setIsLoadingStore(false);
    };

    getStore();

    return () => {
      if (storeInstance != null) {
        removeOrbitDbStoreListeners(storeInstance);
      }
      cancelled = true;
    };
  }, [storeCacheContext.isLoading, params]);

  // Initialize listeners when store is retrieved
  useEffect(() => {
    if (kvStore == null) return;

    // Keep a ref for cleanup function
    let storeRef = kvStore;

    // Load store data on init
    reloadStoreDataForStore(storeRef);

    return () => {
      logger.debug('Cleaning up current KV store');
      resetState();
      storeRef.events.removeAllListeners();
    };
  }, [kvStore]);

  const state: KvStoreState<TData> = {
    isLoadingStore: isLoadingStore,
    store: kvStore,
    storeData: kvStoreData,
    reloadStoreData,
    initError: storeInitError,
  };

  return state;
};
