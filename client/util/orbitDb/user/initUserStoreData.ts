import KeyValueStore from 'orbit-db-kvstore';

const initUserStoreData = async (userKvStore: KeyValueStore<unknown>) => {
  await userKvStore.put('feeds', []);
};

export default initUserStoreData;
