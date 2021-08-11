import OrbitDB from 'orbit-db';
import KeyValueStore from 'orbit-db-kvstore';

export type KvStoreParams = {
  address: string;
  create: boolean;
};

export const getKvStore = async (
  db: OrbitDB,
  params: KvStoreParams
): Promise<KeyValueStore<unknown>> => {
  const store = await db.kvstore(params.address, {
    create: params.create,
    accessController: {
      write: ['*'],
    },
  });
  await store.load();

  return store;
};
