import KeyValueStore from 'orbit-db-kvstore';
import React, { useEffect, useState } from 'react';
import { mapValues } from 'lodash';
import getLogger from '../../util/getLogger';
import { useStoreCache } from '../context/orbitDb/storeCacheContext';
import {
  getStoreAddressForUser,
  setStoreAddressForUser,
} from '../util/localStorage/userDbAddress';
import FeedKvStoreData from '../util/orbitDb/feed/FeedKvStoreData';
import initUserStoreData from '../util/orbitDb/user/initUserStoreData';
import isUserStoreInitialized from '../util/orbitDb/user/isUserStoreInitialized';
import UserKvStoreData from '../util/orbitDb/user/UserKvStoreData';
import { useOrbitDb } from '../context/orbitDb/orbitDbContext';
import { GetKvStoreParams } from '../util/orbitDb/orbitDbKvStoreUtils';
import { useKvStore } from '../context/orbitDb/kvStore/useKvStore';

const logger = getLogger('UseRegistryUser');

export type UseRegistryUserState = {
  // User State
  userId?: string;
  setUserId(id?: string): void;
  isLoadingUser: boolean;
  loadError: boolean;
  userKvStoreData?: UserKvStoreData;
  // User Feeds State
  isLoadingUserFeeds: boolean;
  loadedUserFeeds: Record<string, FeedKvStoreData>;
  // Exposed functions
  createUserFeed(name: string, iconUri?: string): Promise<void>;
  deleteUserFeed(address: string): Promise<void>;
};

// A lightweight wrapper with util methods for interacting with the user root store
const useRegistryUser = (): UseRegistryUserState => {
  const [userId, setUserId] = useState<string>();
  const [userKvStoreParams, setUserKvStoreParams] =
    useState<GetKvStoreParams>();

  const orbitDbContext = useOrbitDb();
  const userKvStoreState = useKvStore<UserKvStoreData>(userKvStoreParams);

  // Initialize user on load
  useEffect(() => {
    const getUserStoreIfAble = async () => {
      if (!userId) {
        // Reset if no user
        setUserKvStoreParams(undefined);
        return;
      }

      // See if we have created a user store previously
      const existingStoreAddress = getStoreAddressForUser(userId);

      if (existingStoreAddress) {
        // Load the existing store
        setUserKvStoreParams({
          addressOrName: existingStoreAddress,
        });
      } else {
        // Attempt to create a new store for the user - this creates a store but does not write data
        // The useEffect hook below will pick up on the store creation and attempt to write to it if the
        // identity is valid
        setUserKvStoreParams({
          addressOrName: userId,
          createParams: {
            accessController: {
              write: [userId], // Restrict write to user
            },
          },
        });
      }
    };

    getUserStoreIfAble();
  }, [userId]);

  // When store is loaded, see if we need to create empty data
  useEffect(() => {
    const initUserStoreIfNeeded = async () => {
      // No user ID, so no store to create
      if (!userId) {
        return;
      }

      // No store to initialize
      if (
        userKvStoreState.storeData == null ||
        userKvStoreState.store == null
      ) {
        return;
      }

      if (isUserStoreInitialized(userKvStoreState.storeData)) {
        // Store is initialized, no action needed
        logger.debug('User has existing store data, skipping init');
        return;
      }

      if (orbitDbContext.identity?.id === userId) {
        // Can initialize the store
        logger.debug('Initializing user store');
        await initUserStoreData(userKvStoreState.store);
        // Save to localstorage
        setStoreAddressForUser(
          userId,
          userKvStoreState.store.address.toString()
        );
      } else {
        logger.warn(
          'OrbitDB identity does not match userID, cannot initialize store!'
        );
      }
    };

    initUserStoreIfNeeded();
  }, [
    orbitDbContext.identity?.id,
    userId,
    userKvStoreState.store,
    userKvStoreState.storeData,
  ]);

  // User feeds
  const storeCacheContext = useStoreCache();
  const [isLoadingUserFeeds, setIsLoadingUserFeeds] = useState(false);
  const [loadedUserFeedStores, setLoadedUserFeedStores] = useState<
    Record<string, KeyValueStore<unknown>>
  >({});

  // Initialize user feeds when user is loaded
  useEffect(() => {
    let cancelled = false;
    // TODO: Clear existing listeners

    const loadUserFeeds = async () => {
      // Reset state
      setLoadedUserFeedStores({});

      if (userKvStoreState.isLoadingStore || storeCacheContext == null) return;

      // Begin loading
      setIsLoadingUserFeeds(true);

      const userStoreData = userKvStoreState.storeData;

      // No work needed
      if (userStoreData == null || userStoreData.feeds.length === 0) {
        setIsLoadingUserFeeds(false);
        return;
      }

      const inProgressUserFeeds: Record<string, KeyValueStore<unknown>> = {};

      for (const feedKvStoreAddress of userStoreData.feeds) {
        if (cancelled) break;

        const store = await storeCacheContext.getKvStore<unknown>({
          addressOrName: feedKvStoreAddress,
        });
        await store.load();

        // TODO: add listeners

        inProgressUserFeeds[feedKvStoreAddress] = store;
      }

      if (!cancelled) {
        setLoadedUserFeedStores(inProgressUserFeeds);
        setIsLoadingUserFeeds(false);
      } else {
        // TODO: remove listeners on inProgressFeeds
      }
    };

    loadUserFeeds();
    return () => {
      cancelled = true;
    };
  }, [
    userKvStoreState.storeData,
    userKvStoreState.isLoadingStore,
    storeCacheContext == null,
  ]);

  // Create the actual user feed data
  const loadedUserFeeds = mapValues(
    loadedUserFeedStores,
    (store: KeyValueStore<unknown>): FeedKvStoreData => {
      return {
        ...store.all,
      } as unknown as FeedKvStoreData;
    }
  );

  // Functions to create and delete user feeds (TODO)

  const hookData: UseRegistryUserState = {
    // User State
    userId,
    setUserId,
    isLoadingUser: userKvStoreState.isLoadingStore,
    loadError: userKvStoreState.initError ?? false,
    userKvStoreData: userKvStoreState.storeData,
    // User Feeds State
    isLoadingUserFeeds,
    loadedUserFeeds,
    createUserFeed(name: string, iconUri?: string): Promise<void> {
      return Promise.resolve(undefined);
    },
    deleteUserFeed(address: string): Promise<void> {
      return Promise.resolve(undefined);
    },
  };

  return hookData;
};

export default useRegistryUser;
