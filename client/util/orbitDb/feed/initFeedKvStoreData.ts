import KeyValueStore from 'orbit-db-kvstore';
import FeedKvStoreData from './FeedKvStoreData';

const initFeedKvStoreData = async (
  feedKvStore: KeyValueStore<unknown>,
  feedStoreData: FeedKvStoreData
) => {
  await feedKvStore.put('name', feedStoreData.name);
  await feedKvStore.put('iconUri', feedStoreData.iconUri);
  await feedKvStore.put('postsDbAddress', feedStoreData.postsDbAddress);
};

export default initFeedKvStoreData;
