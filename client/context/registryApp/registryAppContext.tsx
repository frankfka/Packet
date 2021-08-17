import React, { createContext, useContext, useEffect, useState } from 'react';
import getLogger from '../../../util/getLogger';
import {
  getLocalStorageCurrentRegistryUserId,
  setLocalStorageCurrentRegistryUserId,
} from '../../util/localStorage/registryCurrentUserId';
import { FeedKvStoreData } from '../../util/orbitDb/feed/FeedDataTypes';
import { createEthereumOrbitDbIdentity } from '../../util/orbitDb/orbitDbUtils';
import RegistryUserKvStoreData from '../../util/orbitDb/user/RegistryUserKvStoreData';
import { useEthereumContext } from '../ethereum/ethereumContext';
import { useOrbitDb } from '../orbitDb/orbitDbContext';
import useRegistryUserUtils from './useRegistryUserUtils';

const logger = getLogger('RegistryApp-Context');

type RegistryAppContextData = {
  isReady: boolean; // Whether we have processed logic for initial render
  // User functions
  login(): Promise<void>;
  logout(): Promise<void>;
  // User state from UserKvStore
  userId?: string;
  loadingUserData: boolean;
  userData?: RegistryUserKvStoreData;
  isOrbitIdentityInitialized: boolean;
  requestOrbitIdentity(): Promise<void>;
  // Feed functions
  // User Feeds State
  isLoadingUserFeeds: boolean;
  loadedUserFeeds: Record<string, FeedKvStoreData>;
  // Exposed functions
  createUserFeed(name: string, iconUri?: string): Promise<string | undefined>;
  deleteUserFeed(address: string): Promise<void>;
  // Feed state
  // userFeeds: FeedKvStoreData[]
  // createNewFeed(metadata: FeedMetadataKvStoreData): Promise<string> // Resolves to OrbitDB address of the feed
  // getPostsForFeed(feedAddress: string): Promise<FeedPost[]>
  // publishPostForFeed(feedAddress: string, post: FeedPost)
  // Not yet addressed: deleteFeed, changeFeedMetadata, etc.
};

export const RegistryAppContext = createContext<RegistryAppContextData>({
  isReady: false,
  async login() {},
  async logout() {},
  loadingUserData: false,
  isOrbitIdentityInitialized: false,
  async requestOrbitIdentity() {},
  isLoadingUserFeeds: false,
  loadedUserFeeds: {},
  async createUserFeed() {
    return undefined;
  },
  async deleteUserFeed() {},
});

/*
A util context provider that uses the root-level contexts (OrbitDB, ethereum, etc.) to expose
application-specific functionality, such as:

- Handling authentication requirements for writing data
- Handling current user and authentication context
- Handling the required databases
 */
export const RegistryAppContextProvider: React.FC = ({ children }) => {
  const [isReady, setIsReady] = useState(false);

  const ethereumContext = useEthereumContext();
  const orbitDbContext = useOrbitDb();

  /*
  User
   */
  const registryUserState = useRegistryUserUtils();

  // Load current user on init
  useEffect(() => {
    const currentUserId = getLocalStorageCurrentRegistryUserId();

    if (currentUserId) {
      logger.debug('Current user ID exists', currentUserId);
      registryUserState.setUserId(currentUserId);
    }
  }, []);

  // Listen for orbitDB ready
  useEffect(() => {
    if (orbitDbContext.initError || orbitDbContext.orbitDb != null) {
      setIsReady(true);
    }
  }, [orbitDbContext.initError, orbitDbContext.orbitDb]);

  // Login function - will initialize both ethereum AND the orbitDB identity
  const login = async () => {
    logger.debug('Logging in');

    const currentSigner = await ethereumContext.init();
    if (currentSigner == null) {
      logger.warn(
        'No signer resulted from initializing ethereum, aborting sign in'
      );
      return;
    }

    // Update orbit context
    logger.debug('Creating and setting orbitDB identity');
    const orbitIdentity = await createEthereumOrbitDbIdentity(currentSigner);
    orbitDbContext.setIdentity(orbitIdentity);

    const userId = orbitIdentity.id;

    // Update user data store
    registryUserState.setUserId(userId);

    // Update local storage
    setLocalStorageCurrentRegistryUserId(userId);
  };

  // Logout function
  const logout = async () => {
    setLocalStorageCurrentRegistryUserId(undefined);
    orbitDbContext.setIdentity(undefined);
    registryUserState.setUserId(undefined);
  };

  // Function to request orbit identity (TODO: DRY)
  const requestOrbitIdentity = async () => {
    // TODO: init with requested address?
    const currentSigner = await ethereumContext.init();
    if (currentSigner == null) {
      logger.warn(
        'No signer resulted from initializing ethereum, aborting sign in'
      );
      return;
    }

    // Update orbit context
    logger.debug('Creating and setting orbitDB identity');
    const orbitIdentity = await createEthereumOrbitDbIdentity(currentSigner);
    orbitDbContext.setIdentity(orbitIdentity);
  };

  // Create context data
  const contextData: RegistryAppContextData = {
    // User
    isReady,
    loadingUserData: registryUserState.isLoadingUser,
    userData: registryUserState.userKvStoreData,
    userId: registryUserState.userId,
    login,
    logout,
    isOrbitIdentityInitialized:
      orbitDbContext.identity?.id != null &&
      orbitDbContext.identity.id === registryUserState.userId,
    requestOrbitIdentity,
    // Feed
    isLoadingUserFeeds: registryUserState.isLoadingUserFeeds,
    loadedUserFeeds: registryUserState.loadedUserFeeds,
    createUserFeed: registryUserState.createUserFeed,
    deleteUserFeed: registryUserState.deleteUserFeed,
  };

  return (
    <RegistryAppContext.Provider value={contextData}>
      {children}
    </RegistryAppContext.Provider>
  );
};

export const useRegistryApp = () => useContext(RegistryAppContext);
