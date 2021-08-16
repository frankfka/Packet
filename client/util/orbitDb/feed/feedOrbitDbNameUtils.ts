import { nanoid } from 'nanoid';

export const getFeedId = (): string => {
  return 'feed-' + nanoid();
};

export const getFeedPostsStoreName = (feedId: string): string => {
  return feedId + '/posts';
};
