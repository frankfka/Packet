import OrbitDB from 'orbit-db';
import FeedStore from 'orbit-db-feedstore';
import { GetStoreParams } from './orbitDbStoreUtils';

export type GetFeedStoreParams = GetStoreParams;

// TODO: Generalize this and kv store
export const createFeedStore = async <TValueType>(
  db: OrbitDB,
  params: GetFeedStoreParams
): Promise<FeedStore<TValueType>> => {
  let store: FeedStore<TValueType>;

  if (params.createParams) {
    store = await db.feed<TValueType>(params.addressOrName, {
      create: true,
      accessController: params.createParams.accessController,
    });
  } else {
    store = await db.feed<TValueType>(params.addressOrName);
  }
  await store.load();

  return store;
};
