import { IPFS } from 'ipfs-core-types';
import OrbitDB from 'orbit-db';
import OrbitIdentity from 'orbit-db-identity-provider';

export const createOrbitDbInstance = async (ipfs: IPFS): Promise<OrbitDB> => {
  const identity = await OrbitIdentity.createIdentity({
    id: 'fixed-id',
  });

  console.debug(
    '[ORBIT-DB] Created identity with public key: ',
    identity.publicKey
  );

  return await OrbitDB.createInstance(ipfs, {
    directory: './orbit-db',
    identity,
  });
};
