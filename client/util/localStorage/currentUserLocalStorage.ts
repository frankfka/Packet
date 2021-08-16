import getLogger from '../../../util/getLogger';
import { LocalStorageUserType } from './localStorageConstants';

const logger = getLogger('LocalStorage');

const REGISTRY_CURRENT_USER_ID_LOCAL_STORAGE_KEY =
  'PACKET_REGISTRY.currentUserId';
const INTAKE_CURRENT_USER_ID_LOCAL_STORAGE_KEY = 'PACKET_INTAKE.currentUserId';

const getKey = (userType: LocalStorageUserType): string => {
  return userType === 'registry'
    ? REGISTRY_CURRENT_USER_ID_LOCAL_STORAGE_KEY
    : INTAKE_CURRENT_USER_ID_LOCAL_STORAGE_KEY;
};

export const getCurrentUserIdFromLocalStorage = (
  userType: LocalStorageUserType
): string | undefined => {
  logger.debug('Getting current registry user from localstorage');
  const currentUserId = localStorage.getItem(getKey(userType));
  return currentUserId ? currentUserId : undefined;
};

export const setCurrentUserIdFromLocalStorage = (
  userType: LocalStorageUserType,
  userId?: string
): void => {
  logger.debug('Setting current registry user to localstorage', userId);
  if (userId) {
    localStorage.setItem(getKey(userType), userId);
  } else {
    localStorage.removeItem(getKey(userType));
  }
};
