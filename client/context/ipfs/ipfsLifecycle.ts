import { IPFS } from 'ipfs-core-types';
import Ipfs from 'ipfs';
import ipfsConfig from './ipfsConfig';

export const createIpfs = async (): Promise<IPFS> => {
  return await Ipfs.create(ipfsConfig);
};

export const stopIpfs = async (ipfs: IPFS) => {
  await ipfs.stop();
};
