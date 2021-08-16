export type FeedKvStoreData = {
  name: string;
  iconUri?: string;
  postsDbAddress: string;
  publisherId: string;
};

export type FeedPostData = {
  title: string;
  content: string; // A markdown string for now
  createdAt: Date;
};

export type JsonFeedPostData = Omit<FeedPostData, 'createdAt'> & {
  createdAt: string; // ISO string
};
