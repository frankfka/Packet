import getLogger from '../../../util/getLogger';

const logger = getLogger('LocalStorage');

export const CURRENT_USER_ID_LOCAL_STORAGE_KEY =
  'PACKET_REGISTRY.currentUserId';

export const getCurrentUserIdFromLocalStorage = (): string | undefined => {
  logger.debug('Getting current user from localstorage');
  const currentUserId = localStorage.getItem(CURRENT_USER_ID_LOCAL_STORAGE_KEY);
  return currentUserId ? currentUserId : undefined;
};

export const setCurrentUserIdFromLocalStorage = (userId?: string): void => {
  logger.debug('Setting current user to localstorage', userId);
  if (userId) {
    localStorage.setItem(CURRENT_USER_ID_LOCAL_STORAGE_KEY, userId);
  } else {
    localStorage.removeItem(CURRENT_USER_ID_LOCAL_STORAGE_KEY);
  }
};
