import OrbitDB from 'orbit-db';
import KeyValueStore from 'orbit-db-kvstore';

export type GetStoreParams = {
  addressOrName: string;
  createParams?: OrbitDbCreateStoreParams;
};

export type OrbitDbCreateStoreParams = {
  accessController?: ICreateOptions['accessController'];
};

export const getStoreAddress = async (
  orbitDb: OrbitDB,
  storeType: string,
  params: GetStoreParams
): Promise<string> => {
  if (OrbitDB.isValidAddress(params.addressOrName)) {
    return params.addressOrName;
  }

  const dbAddress = await orbitDb.determineAddress(
    params.addressOrName,
    storeType,
    params.createParams
  );

  // Typing error, so casting here.
  return dbAddress as unknown as string;
};
