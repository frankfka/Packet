import KeyValueStore from 'orbit-db-kvstore';
import { OrbitKvStoreData } from '../OrbitDbTypes';
import RegistryUserKvStoreData from './RegistryUserKvStoreData';

export const getRegistryUserDbName = (userId: string): string => {
  return 'registry-' + userId;
};

// Root user methods
export const saveRegistryUserStoreData = async (
  store: KeyValueStore<unknown>,
  userData: RegistryUserKvStoreData
) => {
  await store.put('feeds', userData.feeds);
};

export const isRegistryUserStoreInitialized = (
  userStore: OrbitKvStoreData<unknown>
) => {
  return userStore['feeds'] != null;
};

// Feed methods
export const addFeedToUserData = async (
  store: KeyValueStore<unknown>,
  feedAddress: string
) => {
  const userFeeds: string[] = store.get('feeds') as string[];
  const newUserFeeds = [...userFeeds, feedAddress];
  await store.put('feeds', newUserFeeds);
};

export const deleteFeedFromUserData = async (
  store: KeyValueStore<unknown>,
  feedAddress: string
) => {
  const userFeeds: string[] = store.get('feeds') as string[];
  const newUserFeeds = userFeeds.filter((address) => address !== feedAddress);
  await store.put('feeds', newUserFeeds);
};
