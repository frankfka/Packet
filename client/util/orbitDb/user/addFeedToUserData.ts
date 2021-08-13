import KeyValueStore from 'orbit-db-kvstore';

const addFeedToUserData = async (
  userKvStore: KeyValueStore<unknown>,
  feedAddress: string
) => {
  const userFeeds: string[] = userKvStore.get('feeds') as string[];
  const newUserFeeds = [...userFeeds, feedAddress];
  await userKvStore.put('feeds', newUserFeeds);
};

export default addFeedToUserData;
