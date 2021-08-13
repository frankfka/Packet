import KeyValueStore from 'orbit-db-kvstore';
import { useEffect, useState } from 'react';
import getLogger from '../../../../util/getLogger';
import { useStoreCache } from '../storeCacheContext';
import {
  GetKvStoreParams,
  OrbitKvStoreData,
} from '../../../util/orbitDb/orbitDbKvStoreUtils';

export const logger = getLogger('UseKvStore');

// Exposes KNOWN kv data types
export type KvStoreData<TData> = TData & OrbitKvStoreData<unknown>;

export type KvStoreState<TData> = {
  isLoadingStore: boolean;
  store?: KeyValueStore<unknown>;
  storeData?: KvStoreData<TData>;
  reloadStoreData(): void;
  initError?: boolean;
};

export const useKvStore = <TData>(
  // Optional params so that we don't need to create the store when creating the hook
  params?: GetKvStoreParams
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

    if (storeCacheContext == null || params == null) return;

    let cancelled = false;

    const getStore = async () => {
      logger.debug('Getting store with params', params);

      setIsLoadingStore(true);
      try {
        const store = await storeCacheContext.getKvStore<unknown>(params);

        if (cancelled) return;

        logger.debug('Retrieved KV store', store);

        setKvStore(store);
      } catch (err) {
        logger.error('Error getting KV store', err);

        if (cancelled) return;

        setStoreInitError(true);
      }
      setIsLoadingStore(false);
    };

    getStore();
  }, [storeCacheContext, params]);

  // Initialize listeners when store is retrieved
  useEffect(() => {
    if (kvStore == null) return;

    let storeRef = kvStore;

    logger.debug('Listening to events');

    // Load store data on init
    reloadStoreDataForStore(storeRef);

    // Occurs when replication is in-progress
    storeRef.events.on('replicate', (address) => {
      logger.debug('db.events.replicate', address.toString());
    });

    // Occurs when replication is done
    storeRef.events.on('replicated', (address) => {
      logger.debug('db.events.replicated', address.toString());
      reloadStoreDataForStore(storeRef);
    });

    // Occurs when a new operation is executed
    storeRef.events.on('write', (address, entry) => {
      logger.debug('db.events.write', address.toString(), 'Entry', entry);
      reloadStoreDataForStore(storeRef);
    });

    // Occurs when a peer connects
    storeRef.events.on('peer', (peer) => {
      logger.debug('db.events.peer', peer);
    });

    return () => {
      logger.debug('Cleaning up current KV store listeners');
      storeRef.events.removeAllListeners();
    };
  }, [kvStore]);

  const state: KvStoreState<TData> = {
    isLoadingStore,
    store: kvStore,
    storeData: kvStoreData,
    reloadStoreData,
    initError: storeInitError,
  };

  return state;
};
