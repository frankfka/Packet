import React, { useEffect, useState } from 'react';
import {
  IpfsContextProvider,
  useIpfs,
} from '../../../context/ipfs/IpfsContext';
import { OrbitDbContextProvider } from '../../../context/orbitDb/orbitDbContext';
import { StoreCacheContextProvider } from '../../../context/orbitDb/storeCacheContext';
import HomePageIpfsSection from './HomePageIpfsSection';
import HomePageKvStoreSection from './HomePageKvStoreSection';
import HomePageOrbitDbSection from './HomePageOrbitDbSection';

const HomePage = () => {
  return (
    <IpfsContextProvider>
      <OrbitDbContextProvider>
        <StoreCacheContextProvider>
          {/*Root Connections*/}
          <div
            style={{
              margin: 24,
              backgroundColor: 'lightcoral',
            }}
          >
            <h1>Root Connections</h1>
            <HomePageIpfsSection />
            <HomePageOrbitDbSection />
          </div>
          {/*KV Store*/}
          <div
            style={{
              margin: 24,
              backgroundColor: 'lightpink',
            }}
          >
            <h1>KV Store</h1>
            <HomePageKvStoreSection />
          </div>
        </StoreCacheContextProvider>
      </OrbitDbContextProvider>
    </IpfsContextProvider>
  );
};

export default HomePage;
