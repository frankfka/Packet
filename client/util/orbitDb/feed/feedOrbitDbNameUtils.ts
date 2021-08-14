export const getFeedRootStoreName = (
  publisherId: string,
  feedName: string
): string => {
  return publisherId + '/feeds/' + feedName;
};

export const getFeedPostsStoreName = (
  publisherId: string,
  feedName: string
): string => {
  return getFeedRootStoreName(publisherId, feedName) + '/posts';
};
