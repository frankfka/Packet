import { CssBaseline, MuiThemeProvider } from '@material-ui/core';
import type { AppProps } from 'next/app';
import { EthereumContextProvider } from '../client/context/ethereum/ethereumContext';
import { IpfsContextProvider } from '../client/context/ipfs/IpfsContext';
import { OrbitDbContextProvider } from '../client/context/orbitDb/orbitDbContext';
import { StoreCacheContextProvider } from '../client/context/orbitDb/storeCacheContext';
import { RegistryAppContextProvider } from '../client/context/registryApp/registryAppContext';

import theme from '../client/theme/theme';

function MyApp({ Component, pageProps }: AppProps) {
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
                {/*Registry App Context (Utils that leverage surrounding contect*/}
                <RegistryAppContextProvider>
                  {/*Actual component*/}
                  <Component {...pageProps} />
                </RegistryAppContextProvider>
              </StoreCacheContextProvider>
            </OrbitDbContextProvider>
          </IpfsContextProvider>
        </EthereumContextProvider>
      </MuiThemeProvider>
    </>
  );
}
export default MyApp;
