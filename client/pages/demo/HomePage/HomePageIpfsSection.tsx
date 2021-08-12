import React from 'react';
import { useIpfs } from '../../../context/ipfs/IpfsContext';

const HomePageIpfsSection = () => {
  const ipfsContext = useIpfs();

  let content: React.ReactElement | undefined = undefined;

  if (ipfsContext.initError) {
    content = <h4>IPFS Init Error</h4>;
  } else if (ipfsContext.ipfs) {
    content = <h4>IPFS Initialized</h4>;
  }

  return (
    <div>
      <h3>IPFS Info</h3>
      {content}
    </div>
  );
};

export default HomePageIpfsSection;
