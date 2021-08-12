import OrbitDB from 'orbit-db';
import KeyValueStore from 'orbit-db-kvstore';
import getLogger from '../../../../../util/getLogger';
import { GetStoreParams } from '../orbitDbStoreUtils';

export type KvStoreData<TValueType> = Record<string, TValueType>;

export const kvStoreLogger = getLogger('KVStore');

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
