import KeyValueStore from 'orbit-db-kvstore';

const deleteFeedFromUserData = async (
  userKvStore: KeyValueStore<unknown>,
  feedAddress: string
) => {
  const userFeeds: string[] = userKvStore.get('feeds') as string[];
  const newUserFeeds = userFeeds.filter((address) => address !== feedAddress);
  await userKvStore.put('feeds', newUserFeeds);
};

export default deleteFeedFromUserData;
