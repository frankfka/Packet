import React from 'react';

import { EthereumContextProvider } from '../../../context/ethereum/ethereumContext';
import AuthWithEthereumContent from './AuthWithEthereumContent';

const AuthenticationPage = () => {
  return (
    <EthereumContextProvider>
      <AuthWithEthereumContent />
    </EthereumContextProvider>
  );
};

export default AuthenticationPage;
