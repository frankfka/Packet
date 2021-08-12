import KeyValueStore from 'orbit-db-kvstore';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useOrbitDb } from '../orbitDbContext';
import { getKvStore, KvStoreParams } from './kvStoreUtils';

type KvStoreContextData = {
  store?: KeyValueStore<unknown>;
  storeData?: Record<string, unknown>;
  reloadStoreData(): void;
  setStoreParams(params?: KvStoreParams): void;
  initError?: boolean;
};

export const KvStoreContext = createContext<KvStoreContextData>({
  setStoreParams() {},
  reloadStoreData() {},
});

export const KvStoreContextProvider: React.FC = ({ children }) => {
  const { orbitDb, initError: orbitDbInitError } = useOrbitDb();

  const [storeParams, setStoreParams] = useState<KvStoreParams>();
  const [kvStore, setKvStore] = useState<KeyValueStore<unknown>>();
  const [kvStoreData, setKvStoreData] = useState<Record<string, unknown>>({});
  const [storeInitError, setStoreInitError] = useState(false);

  const reloadStoreData = async () => {
    console.debug('[KvStore] Reloading store data', kvStore?.all);

    if (kvStore) {
      await kvStore.load();
      setKvStoreData({ ...kvStore.all });
    } else {
      setKvStoreData({});
    }
  };

  useEffect(() => {
    if (orbitDb == null) return;

    setKvStoreData({});
    setKvStore(undefined);
    setStoreInitError(false);

    if (storeParams == null) {
      // If we have no commands, we're done here - just return
      return;
    }

    console.debug('[KvStore] Creating store');

    // TODO: this should be wrapped in an abortcontroller
    getKvStore(orbitDb, storeParams)
      .then((store) => {
        console.debug('[KvStore] Created store', store);
        setKvStore(store);
      })
      .catch((err) => {
        console.error('[KvStore] Error creating KV store', err);
        setStoreInitError(true);
      });
  }, [orbitDb, storeParams]);

  useEffect(() => {
    if (kvStore == null) return;

    console.debug('[KvStore] Listening to events');

    // Load store on init
    reloadStoreData();

    kvStore.events.on('replicate', (address) => {
      console.debug('[KvStore] db.events.replicate', address.toString());
    });

    kvStore.events.on('replicated', (address) => {
      console.debug('[KvStore] db.events.replicated', address.toString());
      reloadStoreData();
    });

    kvStore.events.on('write', (address, entry) => {
      console.debug(
        '[KvStore] db.events.write',
        address.toString(),
        'Entry',
        entry
      );
      reloadStoreData();
    });

    kvStore.events.on('peer', (peer) => {
      console.debug('[KvStore] db.events.peer', peer);
    });

    return () => {
      console.debug('[KvStore] Closing store connection');
      kvStore?.close();
    };
  }, [kvStore]);

  const contextData: KvStoreContextData = {
    store: kvStore,
    storeData: kvStoreData,
    reloadStoreData,
    initError: orbitDbInitError || storeInitError,
    setStoreParams,
  };

  return (
    <KvStoreContext.Provider value={contextData}>
      {children}
    </KvStoreContext.Provider>
  );
};

export const useKvStore = () => useContext(KvStoreContext);
