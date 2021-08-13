export const USER_STORE_ADDRESS_BASE_KEY = 'PACKET_REGISTRY.userStore.';

export const getStoreAddressForUser = (userId: string): string | null => {
  return localStorage.getItem(USER_STORE_ADDRESS_BASE_KEY + userId);
};

export const setStoreAddressForUser = (
  userId: string,
  storeAddress: string
): void => {
  localStorage.setItem(USER_STORE_ADDRESS_BASE_KEY + userId, storeAddress);
};
