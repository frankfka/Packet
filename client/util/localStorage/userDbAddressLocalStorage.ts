import { LocalStorageUserType } from './localStorageConstants';

const REGISTRY_USER_STORE_ADDRESS_BASE_KEY = 'PACKET_REGISTRY.userStore.';
const INTAKE_USER_STORE_ADDRESS_BASE_KEY = 'PACKET_INTAKE.userStore.';

const getBaseKey = (userType: LocalStorageUserType): string => {
  return userType === 'registry'
    ? REGISTRY_USER_STORE_ADDRESS_BASE_KEY
    : INTAKE_USER_STORE_ADDRESS_BASE_KEY;
};

export const getStoreAddressForUserFromLocalStorage = (
  userType: LocalStorageUserType,
  userId: string
): string | null => {
  return localStorage.getItem(getBaseKey(userType) + userId);
};

export const setStoreAddressForUserToLocalStorage = (
  userType: LocalStorageUserType,
  userId: string,
  storeAddress: string
): void => {
  localStorage.setItem(getBaseKey(userType) + userId, storeAddress);
};
