import FeedStore from 'orbit-db-feedstore';
import { dateFromIsoString, dateToIsoString } from '../../dateUtils';
import { FeedPostData, JsonFeedPostData } from './FeedPostData';

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
