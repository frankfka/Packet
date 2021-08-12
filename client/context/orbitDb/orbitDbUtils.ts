import { IPFS } from 'ipfs-core-types';
import OrbitDB from 'orbit-db';
import OrbitIdentity, { Identity } from 'orbit-db-identity-provider';

export const createDefaultOrbitDbIdentity = async (): Promise<Identity> => {
  return OrbitIdentity.createIdentity();
};

export const createOrbitDbInstance = async (
  ipfs: IPFS,
  identity?: Identity
): Promise<OrbitDB> => {
  return OrbitDB.createInstance(ipfs, {
    directory: './orbit-db',
    identity,
  });
};
