const REGISTRY_USER_STORE_ADDRESS_BASE_KEY = 'PACKET_REGISTRY.userStore.';

export const getLocalStorageRegistryUserStoreAddress = (
  userId: string
): string | null => {
  return localStorage.getItem(REGISTRY_USER_STORE_ADDRESS_BASE_KEY + userId);
};

export const setLocalStorageRegistryUserStoreAddress = (
  userId: string,
  storeAddress: string
): void => {
  localStorage.setItem(
    REGISTRY_USER_STORE_ADDRESS_BASE_KEY + userId,
    storeAddress
  );
};
