import { OrbitKvStoreData } from '../orbitDbKvStoreUtils';

const isUserStoreInitialized = (userStore: OrbitKvStoreData<unknown>) => {
  return userStore['feeds'] != null;
};

export default isUserStoreInitialized;
