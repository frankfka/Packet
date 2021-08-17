import getLogger from '../../../util/getLogger';

const logger = getLogger('LocalStorage');

const REGISTRY_CURRENT_USER_ID_LOCAL_STORAGE_KEY =
  'PACKET_REGISTRY.currentUserId';

export const getLocalStorageCurrentRegistryUserId = (): string | undefined => {
  logger.debug('Getting current registry user from localstorage');
  const currentUserId = localStorage.getItem(
    REGISTRY_CURRENT_USER_ID_LOCAL_STORAGE_KEY
  );
  return currentUserId ? currentUserId : undefined;
};

export const setLocalStorageCurrentRegistryUserId = (userId?: string): void => {
  logger.debug('Setting current registry user to localstorage', userId);
  if (userId) {
    localStorage.setItem(REGISTRY_CURRENT_USER_ID_LOCAL_STORAGE_KEY, userId);
  } else {
    localStorage.removeItem(REGISTRY_CURRENT_USER_ID_LOCAL_STORAGE_KEY);
  }
};
