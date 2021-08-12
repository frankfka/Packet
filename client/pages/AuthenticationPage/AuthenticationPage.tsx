import React, { useEffect, useState } from 'react';

import Identities from 'orbit-db-identity-provider';
import { ethers } from 'ethers';
import { WindowEthereumProvider } from '../../context/ethereum/ethereumTypes';

const AuthenticationPage = () => {
  const [accountsData, setAccountsData] = useState('');

  const test = async (eth?: WindowEthereumProvider) => {
    if (eth == null) {
      return;
    }

    // This is required to enable metamask
    await eth.enable();

    console.log('Ethereum enabled');

    const provider = new ethers.providers.Web3Provider(eth);

    const wallet = provider.getSigner();

    console.log('Created signer', wallet);

    const orbitDbIdentity = await Identities.createIdentity({
      type: 'ethereum',
      wallet,
    });

    console.log('Created identity', orbitDbIdentity);

    const signature = await wallet.signMessage('Hello world!');
    console.log('Signed', signature);
  };

  // Creates an OrbitDB identity using `window.ethereum`
  useEffect(() => {
    if (window) {
      console.log(window.ethereum);
      setAccountsData('Has ethereum');
      test(window.ethereum);
    } else {
      setAccountsData('');
    }
  }, []);

  return <div>{accountsData}</div>;
};

export default AuthenticationPage;
