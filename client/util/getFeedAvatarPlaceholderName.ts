// First letter of the name, capitalized
const getFeedAvatarPlaceholderName = (feedName: string): string => {
  return feedName.replace(/s+/, '').substr(0, 1).toUpperCase();
};
export default getFeedAvatarPlaceholderName;
