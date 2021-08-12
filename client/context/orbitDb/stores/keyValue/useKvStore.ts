import KeyValueStore from 'orbit-db-kvstore';
import { useEffect, useState } from 'react';
import { useStoreCache } from '../storeCacheContext';
import { GetKvStoreParams, KvStoreData, kvStoreLogger } from './kvStoreUtils';

export type KvStoreState<TValueType> = {
  // TODO: add initializing boolean
  store?: KeyValueStore<TValueType>;
  storeData?: KvStoreData<TValueType>;
  reloadStoreData(): void;
  initError?: boolean;
};

export const useKvStore = <TValueType>(
  // Optional params so that we don't need to create the store when creating the hook
  params?: GetKvStoreParams
): KvStoreState<TValueType> => {
  const storeCacheContext = useStoreCache();

  const [kvStore, setKvStore] = useState<KeyValueStore<TValueType>>();
  const [kvStoreData, setKvStoreData] = useState<KvStoreData<TValueType>>({});
  const [storeInitError, setStoreInitError] = useState(false);

  // Resets state of the hook
  const resetState = () => {
    setKvStoreData({});
    setKvStore(undefined);
    setStoreInitError(false);
  };

  // Completely deinitializes the store by removing listeners
  const deinitStore = () => {
    kvStore?.events.removeAllListeners();
    resetState();
  };

  // Manually reloads all the data in the store
  const reloadStoreData = async () => {
    kvStoreLogger.debug('Reloading store data');

    if (kvStore) {
      await kvStore.load();

      // Use spread operator to create a new object as `kvStore.all`
      // is the same reference between loads
      // @ts-ignore - Ignore to disable typechecking of store types
      setKvStoreData({ ...kvStore.all });
    } else {
      setKvStoreData({});
    }
  };

  // Create the KV store
  useEffect(() => {
    // Reset all state
    resetState();

    if (storeCacheContext == null || params == null) return;

    let cancelled = false;

    const getStore = async () => {
      kvStoreLogger.debug('Getting store with params', params);

      try {
        const store = await storeCacheContext.getKvStore<TValueType>(params);

        if (cancelled) return;

        kvStoreLogger.debug('Retrieved KV store', store);

        setKvStore(store);
      } catch (err) {
        kvStoreLogger.error('Error getting KV store', err);

        if (cancelled) return;

        setStoreInitError(true);
      }
    };

    getStore();
  }, [storeCacheContext, params]);

  // Initialize listeners when store is retrieved
  useEffect(() => {
    if (kvStore == null) return;

    kvStoreLogger.debug('Listening to events');

    // Load store data on init
    reloadStoreData();

    // Occurs when replication is in-progress
    kvStore.events.on('replicate', (address) => {
      kvStoreLogger.debug('db.events.replicate', address.toString());
    });

    // Occurs when replication is done
    kvStore.events.on('replicated', (address) => {
      kvStoreLogger.debug('db.events.replicated', address.toString());
      reloadStoreData();
    });

    // Occurs when a new operation is executed
    kvStore.events.on('write', (address, entry) => {
      kvStoreLogger.debug(
        'db.events.write',
        address.toString(),
        'Entry',
        entry
      );
      reloadStoreData();
    });

    // Occurs when a peer connects
    kvStore.events.on('peer', (peer) => {
      kvStoreLogger.debug('db.events.peer', peer);
    });

    return () => {
      kvStoreLogger.debug('Removing event listeners for store');
      kvStore.events.removeAllListeners();
    };
  }, [kvStore]);

  const state: KvStoreState<TValueType> = {
    store: kvStore,
    storeData: kvStoreData,
    reloadStoreData,
    initError: storeInitError,
  };

  return state;
};
