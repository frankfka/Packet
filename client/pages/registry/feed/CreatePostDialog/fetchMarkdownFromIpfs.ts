/*
Temporary Markdown fetchers to support demo post content through mkdn.link
 */

export const getCid = (cidOrPrefixedUrl: string): string => {
  return cidOrPrefixedUrl.replace('ipfs://', '');
};

export const getCidGatewayUrl = (cid: string): string => {
  return `https://ipfs.io/ipfs/${getCid(cid)}`;
};

export const isIpfsCid = (possibleCid: string): boolean => {
  const isV0Cid = possibleCid.startsWith('Qm');
  const isV1Cid = possibleCid.startsWith('b');

  return isV0Cid || isV1Cid;
};

const fetchMarkdownFromIpfs = async (possibleCid: string): Promise<string> => {
  const cleanedVal = getCid(possibleCid);

  if (!isIpfsCid(cleanedVal)) {
    throw Error('Not a CID: ' + possibleCid);
  }

  const fetchResp = await fetch(getCidGatewayUrl(possibleCid));

  if (fetchResp.status !== 200) {
    throw Error('Invalid status code');
  }

  return fetchResp.text();
};

export default fetchMarkdownFromIpfs;
