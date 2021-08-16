export const getUserDbName = (userId: string): string => {
  return 'registry-' + userId;
};
