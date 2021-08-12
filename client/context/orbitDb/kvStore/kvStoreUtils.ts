import OrbitDB from 'orbit-db';
import AccessController from 'orbit-db-access-controllers/src/access-controller-interface';
import KeyValueStore from 'orbit-db-kvstore';

export type KvStoreParams = {
  address: string;
  create: boolean;
  accessController?: AccessController;
};

export const getKvStore = async (
  db: OrbitDB,
  params: KvStoreParams
): Promise<KeyValueStore<unknown>> => {
  const store = await db.kvstore(params.address, {
    create: params.create,
    accessController: params.accessController,
  });
  await store.load();

  return store;
};
