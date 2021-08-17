import { sortBy } from 'lodash';
import { dateFromIsoString } from '../../util/dateUtils';
import {
  FeedPostWithFeedInfo,
  LoadedSubscribedFeedStore,
  SubscribedFeedData,
  SubscribedFeedStore,
} from './IntakeAppTypes';

// Currently in reverse chronological order
export const getAllFeedPosts = (
  loadedFeedData: Record<string, SubscribedFeedData>
): FeedPostWithFeedInfo[] => {
  const allPostsForEachFeed: FeedPostWithFeedInfo[][] = Object.keys(
    loadedFeedData
  ).map((feedRootAddress) => {
    const feedData = loadedFeedData[feedRootAddress];

    // Map posts to include feed data
    return Object.keys(feedData.posts).map((hash) => {
      const post = feedData.posts[hash];
      return {
        post: {
          ...post,
          hash: hash,
        },
        feedInfo: {
          ...feedData.feedInfo,
          rootAddress: feedRootAddress,
        },
      };
    });
  });

  const flattenedPosts = allPostsForEachFeed.flat();
  return sortBy(flattenedPosts, (post) =>
    dateFromIsoString(post.post.createdAt)
  ).reverse();
};

export const isFeedLoaded = (
  wrappedStore: SubscribedFeedStore
): wrappedStore is LoadedSubscribedFeedStore => {
  return wrappedStore.postsStore != null;
};
