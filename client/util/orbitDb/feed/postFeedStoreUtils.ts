import { nanoid } from 'nanoid';
import FeedStore from 'orbit-db-feedstore';
import KeyValueStore from 'orbit-db-kvstore';
import { dateFromIsoString, dateToIsoString } from '../../dateUtils';
import {
  FeedKvStoreData,
  FeedPostData,
  JsonFeedPostData,
} from './FeedDataTypes';

// Name utils

export const getFeedId = (): string => {
  return 'feed-' + nanoid();
};

export const getFeedPostsStoreName = (feedId: string): string => {
  return feedId + '/posts';
};

// Store IO
export const saveFeedKvStoreData = async (
  feedKvStore: KeyValueStore<unknown>,
  feedStoreData: FeedKvStoreData
) => {
  await feedKvStore.put('name', feedStoreData.name);
  await feedKvStore.put('iconUri', feedStoreData.iconUri);
  await feedKvStore.put('postsDbAddress', feedStoreData.postsDbAddress);
  await feedKvStore.put('publisherId', feedStoreData.publisherId);
};

export const addPostToFeedStore = async (
  store: FeedStore<JsonFeedPostData>,
  postData: FeedPostData
): Promise<string> => {
  const jsonPostData: JsonFeedPostData = {
    ...postData,
    createdAt: dateToIsoString(postData.createdAt),
  };
  return store.add(jsonPostData);
};

export const parseFeedStorePost = (
  savedPost: JsonFeedPostData
): FeedPostData => {
  return {
    ...savedPost,
    createdAt: dateFromIsoString(savedPost.createdAt),
  };
};
