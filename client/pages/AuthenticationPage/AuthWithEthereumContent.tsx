import React, { MouseEventHandler, useEffect, useState } from 'react';
import { useEthereumContext } from '../../context/ethereum/ethereumContext';

const AuthWithEthereumContent = () => {
  const ethContext = useEthereumContext();
  const [signerAddress, setSignerAddress] = useState<string>();

  const onLoginClicked: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    ethContext.init();
  };

  const onSignMessageClicked: MouseEventHandler<HTMLButtonElement> = async (
    e
  ) => {
    e.preventDefault();

    if (ethContext.currentSigner != null) {
      const msg = await ethContext.currentSigner.signMessage('Hello world');
      console.log('Signed message', msg);
    }
  };

  useEffect(() => {
    if (ethContext.currentSigner) {
      ethContext.currentSigner.getAddress().then((address) => {
        setSignerAddress(address);
      });
    } else {
      setSignerAddress(undefined);
    }
  }, [ethContext.currentSigner]);

  return (
    <div>
      {/*{ethContext.currentSigner == null && (*/}
      {/*)}*/}

      <button onClick={onLoginClicked}>Login</button>
      <div>
        <h4>Has window.ethereum:</h4>
        <p>{String(ethContext.providerAvailable)}</p>
      </div>
      <div>
        <h4>Signer Address:</h4>
        <p>{signerAddress}</p>
      </div>
      {ethContext.currentSigner && (
        <button onClick={onSignMessageClicked}>Sign Message</button>
      )}
    </div>
  );
};

export default AuthWithEthereumContent;
