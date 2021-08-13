import OrbitDB from 'orbit-db';
import KeyValueStore from 'orbit-db-kvstore';
import { GetStoreParams } from './orbitDbStoreUtils';

export type OrbitKvStoreData<TValueType> = Record<string, TValueType>;

export type GetKvStoreParams = GetStoreParams;

export const createKvStore = async <TValueType>(
  db: OrbitDB,
  params: GetKvStoreParams
): Promise<KeyValueStore<TValueType>> => {
  let store: KeyValueStore<TValueType>;

  if (params.createParams) {
    store = await db.kvstore<TValueType>(params.addressOrName, {
      create: true,
      accessController: params.createParams.accessController,
    });
  } else {
    store = await db.kvstore<TValueType>(params.addressOrName);
  }
  await store.load();

  return store;
};
