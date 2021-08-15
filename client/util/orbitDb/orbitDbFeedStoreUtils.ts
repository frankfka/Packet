import OrbitDB from 'orbit-db';
import FeedStore from 'orbit-db-feedstore';
import { GetStoreParams } from './orbitDbStoreUtils';

export type OrbitFeedStoreData<TDocType> = TDocType[];

export type FeedDocWithHash<TDocType> = TDocType & { hash: string };

export type OrbitFeedStoreDataWithHash<TDocType> = FeedDocWithHash<TDocType>[];

export type OrbitFeedDocsKeyedByHash<TDocType> = Record<string, TDocType>;

export type GetFeedStoreParams = GetStoreParams;

// TODO: Generalize this and kv store
export const createFeedStore = async <TDocType>(
  db: OrbitDB,
  params: GetFeedStoreParams
): Promise<FeedStore<TDocType>> => {
  let store: FeedStore<TDocType>;

  if (params.createParams) {
    store = await db.feed<TDocType>(params.addressOrName, {
      create: true,
      accessController: params.createParams.accessController,
    });
  } else {
    store = await db.feed<TDocType>(params.addressOrName);
  }
  await store.load();

  return store;
};
