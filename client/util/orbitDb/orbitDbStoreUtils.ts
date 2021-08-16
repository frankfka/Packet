import OrbitDB from 'orbit-db';
import Store from 'orbit-db-store';
import { GetOrbitDbStoreParams, OrbitDbStoreListeners } from './OrbitDbTypes';

export const createOrbitDbStore = async <TStoreType extends Store>(
  db: OrbitDB,
  params: GetOrbitDbStoreParams
): Promise<TStoreType> => {
  let store: Store;

  if (params.createParams) {
    store = await db.create(params.addressOrName, params.type, {
      accessController: params.createParams.accessController,
    });
  } else {
    store = await db.open(params.addressOrName);
  }
  await store.load();

  return store as TStoreType;
};

export const getStoreAddress = async (
  orbitDb: OrbitDB,
  params: GetOrbitDbStoreParams
): Promise<string> => {
  if (OrbitDB.isValidAddress(params.addressOrName)) {
    return params.addressOrName;
  }

  const dbAddress = await orbitDb.determineAddress(
    params.addressOrName,
    params.type,
    params.createParams
  );

  // Typing error, so casting here.
  return dbAddress as unknown as string;
};

const addListener = (
  store: Store,
  eventName: string,
  listener?: (...args: any[]) => void
) => {
  if (listener != null) {
    store.events.on(eventName, listener);
  }
};

export const initOrbitDbStoreListeners = (
  store: Store,
  listeners: OrbitDbStoreListeners
) => {
  // Occurs when replication is in-progress
  addListener(store, 'replicate', listeners.replicate);

  // Occurs when replication is done
  addListener(store, 'replicated', listeners.replicated);

  // Occurs when a new operation is executed
  addListener(store, 'write', listeners.write);

  // Occurs when a peer connects
  addListener(store, 'peer', listeners.peer);
};

export const removeOrbitDbStoreListeners = (store: Store) => {
  store.events.removeAllListeners();
};
