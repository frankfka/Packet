import { CssBaseline, MuiThemeProvider } from '@material-ui/core';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import React from 'react';
import { EthereumContextProvider } from '../client/context/ethereum/ethereumContext';
import { IpfsContextProvider } from '../client/context/ipfs/IpfsContext';
import { OrbitDbContextProvider } from '../client/context/orbitDb/orbitDbContext';
import { StoreCacheContextProvider } from '../client/context/orbitDb/storeCacheContext';
import { RegistryAppContextProvider } from '../client/context/registryApp/registryAppContext';

import theme from '../client/theme/theme';

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  let wrappedComponent: React.ReactElement = <Component {...pageProps} />;
  if (router.pathname.startsWith('/registry')) {
    // Registry context
    wrappedComponent = (
      <RegistryAppContextProvider>
        <Component {...pageProps} />
      </RegistryAppContextProvider>
    );
  }

  return (
    <>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {/*Ethereum Auth*/}
        <EthereumContextProvider>
          {/*IPFS service*/}
          <IpfsContextProvider>
            {/*OrbitDB instance*/}
            <OrbitDbContextProvider>
              {/*OrbitDB store caches*/}
              <StoreCacheContextProvider>
                {wrappedComponent}
              </StoreCacheContextProvider>
            </OrbitDbContextProvider>
          </IpfsContextProvider>
        </EthereumContextProvider>
      </MuiThemeProvider>
    </>
  );
}
export default MyApp;
