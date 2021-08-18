import FeedStore from 'orbit-db-feedstore';
import KeyValueStore from 'orbit-db-kvstore';
import {
  FeedKvStoreData,
  JsonFeedPostData,
} from '../../util/orbitDb/feed/FeedDataTypes';
import { OrbitFeedDocsKeyedByHash } from '../../util/orbitDb/OrbitDbTypes';

// Object that wraps all the stores associated with a feed
export type SubscribedFeedStore = {
  feedInfoStore: KeyValueStore<unknown>;
  postsStore?: FeedStore<JsonFeedPostData>; // Optional as we can't load this without first loading the feedInfoStore
};

// Object that wraps all the data associated with a feed
export type SubscribedFeedData = {
  feedInfo: FeedKvStoreData;
  posts: OrbitFeedDocsKeyedByHash<JsonFeedPostData>;
};

// A Post object that also contains metadata
export type FeedPostWithFeedInfo = {
  feedInfo: FeedKvStoreData & { rootAddress: string }; // Add address identifier
  post: JsonFeedPostData & { hash: string }; // Identify by hash
};
