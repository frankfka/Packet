import KeyValueStore from 'orbit-db-kvstore';
import { useEffect, useState } from 'react';
import getLogger from '../../../../util/getLogger';
import { useStoreCache } from '../storeCacheContext';
import {
  GetKvStoreParams,
  OrbitKvStoreData,
} from '../../../util/orbitDb/orbitDbKvStoreUtils';

export const logger = getLogger('UseKvStore');

export type KvStoreState<TValueType> = {
  isLoadingStore: boolean;
  store?: KeyValueStore<TValueType>;
  storeData?: OrbitKvStoreData<TValueType>;
  reloadStoreData(): void;
  initError?: boolean;
};

export const useKvStore = <TValueType>(
  // Optional params so that we don't need to create the store when creating the hook
  params?: GetKvStoreParams
): KvStoreState<TValueType> => {
  const storeCacheContext = useStoreCache();

  const [isLoadingStore, setIsLoadingStore] = useState(false);
  const [kvStore, setKvStore] = useState<KeyValueStore<TValueType>>();
  const [kvStoreData, setKvStoreData] =
    useState<OrbitKvStoreData<TValueType>>();
  const [storeInitError, setStoreInitError] = useState(false);

  // Resets state of the hook
  const resetState = () => {
    setIsLoadingStore(false);
    setKvStoreData(undefined);
    setKvStore(undefined);
    setStoreInitError(false);
  };

  // Manually reloads all the data in the store
  const reloadStoreData = async () => {
    logger.debug('Reloading store data');

    if (kvStore) {
      await kvStore.load();

      // Use spread operator to create a new object as `kvStore.all`
      // is the same reference between loads
      // @ts-ignore - Ignore to disable typechecking of store types
      setKvStoreData({ ...kvStore.all });
    } else {
      setKvStoreData(undefined);
    }
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
        const store = await storeCacheContext.getKvStore<TValueType>(params);

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

    logger.debug('Listening to events');

    // Load store data on init
    reloadStoreData();

    // Occurs when replication is in-progress
    kvStore.events.on('replicate', (address) => {
      logger.debug('db.events.replicate', address.toString());
    });

    // Occurs when replication is done
    kvStore.events.on('replicated', (address) => {
      logger.debug('db.events.replicated', address.toString());
      reloadStoreData();
    });

    // Occurs when a new operation is executed
    kvStore.events.on('write', (address, entry) => {
      logger.debug('db.events.write', address.toString(), 'Entry', entry);
      reloadStoreData();
    });

    // Occurs when a peer connects
    kvStore.events.on('peer', (peer) => {
      logger.debug('db.events.peer', peer);
    });

    return () => {
      logger.debug('Cleaning up current KV store');
      resetState();
      kvStore.events.removeAllListeners();
    };
  }, [kvStore]);

  const state: KvStoreState<TValueType> = {
    isLoadingStore,
    store: kvStore,
    storeData: kvStoreData,
    reloadStoreData,
    initError: storeInitError,
  };

  return state;
};
