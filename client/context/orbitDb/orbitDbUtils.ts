import { IPFS } from 'ipfs-core-types';
import OrbitDB from 'orbit-db';
import Identities from 'orbit-db-identity-provider';
import OrbitIdentity, { Identity } from 'orbit-db-identity-provider';
import { EthereumSigner } from '../ethereum/ethereumTypes';

export const createDefaultOrbitDbIdentity = async (): Promise<Identity> => {
  return OrbitIdentity.createIdentity();
};

export const createEthereumOrbitDbIdentity = async (
  ethSigner: EthereumSigner
): Promise<Identity> => {
  return Identities.createIdentity({
    type: 'ethereum',
    wallet: ethSigner,
  });
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
