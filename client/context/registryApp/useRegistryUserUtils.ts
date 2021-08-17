import { mapValues } from 'lodash';
import FeedStore from 'orbit-db-feedstore';
import KeyValueStore from 'orbit-db-kvstore';
import { useEffect, useState } from 'react';
import getLogger from '../../../util/getLogger';
import {
  getLocalStorageRegistryUserStoreAddress,
  setLocalStorageRegistryUserStoreAddress,
} from '../../util/localStorage/registryUserDbAddress';
import {
  FeedKvStoreData,
  FeedPostData,
} from '../../util/orbitDb/feed/FeedDataTypes';
import {
  getFeedId,
  getFeedPostsStoreName,
  saveFeedKvStoreData,
} from '../../util/orbitDb/feed/postFeedStoreUtils';
import { GetOrbitDbStoreParams } from '../../util/orbitDb/OrbitDbTypes';
import RegistryUserKvStoreData from '../../util/orbitDb/user/RegistryUserKvStoreData';
import {
  addFeedToUserData,
  deleteFeedFromUserData,
  getRegistryUserDbName,
  isRegistryUserStoreInitialized,
  saveRegistryUserStoreData,
} from '../../util/orbitDb/user/registryUserUtils';
import { useOrbitDb } from '../orbitDb/orbitDbContext';
import { useStoreCache } from '../orbitDb/storeCacheContext';
import { useOrbitDbKvStore } from '../orbitDb/useOrbitDbKvStore';

const logger = getLogger('UseRegistryUser');

export type UseRegistryUserState = {
  // User State
  userId?: string;
  setUserId(id?: string): void;
  isLoadingUser: boolean;
  loadError: boolean;
  userKvStoreData?: RegistryUserKvStoreData;
  // User Feeds State
  isLoadingUserFeeds: boolean;
  loadedUserFeeds: Record<string, FeedKvStoreData>;
  // Exposed functions
  createUserFeed(name: string, iconUri?: string): Promise<string | undefined>;
  deleteUserFeed(address: string): Promise<void>;
};

// A lightweight wrapper with util methods for interacting with the user root store
const useRegistryUserUtils = (): UseRegistryUserState => {
  const [userId, setUserId] = useState<string>();
  const [userKvStoreParams, setUserKvStoreParams] =
    useState<Omit<GetOrbitDbStoreParams, 'type'>>();

  const orbitDbContext = useOrbitDb();
  const userKvStoreState =
    useOrbitDbKvStore<RegistryUserKvStoreData>(userKvStoreParams);

  // Initialize user on load
  useEffect(() => {
    const getUserStoreIfAble = async () => {
      if (!userId) {
        // Reset if no user
        setUserKvStoreParams(undefined);
        return;
      }

      // See if we have created a user store previously
      const existingStoreAddress =
        getLocalStorageRegistryUserStoreAddress(userId);

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
          addressOrName: getRegistryUserDbName(userId),
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

      if (isRegistryUserStoreInitialized(userKvStoreState.storeData)) {
        // Store is initialized, no action needed
        logger.debug('User has existing store data, skipping init');
        return;
      }

      if (orbitDbContext.identity?.id === userId) {
        // Can initialize the store
        logger.debug('Initializing user store');
        await saveRegistryUserStoreData(userKvStoreState.store, {
          feeds: [],
        });
        // Save to localstorage
        setLocalStorageRegistryUserStoreAddress(
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

      if (userKvStoreState.isLoadingStore || storeCacheContext.isLoading)
        return;

      logger.debug('Loading user feed stores');

      // Begin loading
      setIsLoadingUserFeeds(true);

      const userStoreData = userKvStoreState.storeData;

      // No work needed
      if (
        userStoreData == null ||
        userStoreData.feeds == null ||
        userStoreData.feeds.length === 0
      ) {
        setIsLoadingUserFeeds(false);
        return;
      }

      const inProgressUserFeeds: Record<string, KeyValueStore<unknown>> = {};

      for (const feedKvStoreAddress of userStoreData.feeds) {
        if (cancelled) break;

        const store = await storeCacheContext.getStore<KeyValueStore<unknown>>({
          addressOrName: feedKvStoreAddress,
          type: 'keyvalue',
        });
        await store.load();

        // TODO: add listeners

        inProgressUserFeeds[feedKvStoreAddress] = store;
      }

      logger.debug(
        'Loaded user feeds with length',
        Object.keys(inProgressUserFeeds).length
      );

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
    storeCacheContext.isLoading,
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

  // Functions to create and delete user feeds
  const createUserFeed = async (name: string, iconUri?: string) => {
    // Check identity as we're executing a write op
    if (
      userId == null ||
      orbitDbContext.identity == null ||
      userId !== orbitDbContext.identity.id
    ) {
      logger.error('Required identity is not initialized, aborting');
      return;
    }

    if (storeCacheContext.isLoading) {
      logger.error('Loading store cache context, aborting');
      return;
    }

    if (userKvStoreState.store == null) {
      logger.error('No user KV store exists, aborting');
      return;
    }

    const feedId = getFeedId();
    const feedPostsStoreName = getFeedPostsStoreName(feedId);

    // Create the posts feed store
    const newPostsFeedStore: FeedStore<FeedPostData> =
      await storeCacheContext.getStore({
        addressOrName: feedPostsStoreName,
        type: 'feed',
        createParams: {
          accessController: {
            write: [userId],
          },
        },
      });

    const postsFeedStoreAddress = newPostsFeedStore.address.toString();
    logger.debug(
      'Created OrbitDB Feed Store for posts with address',
      postsFeedStoreAddress
    );

    // Now create the root feed KV store
    const feedKvStoreData: FeedKvStoreData = {
      name,
      iconUri,
      postsDbAddress: postsFeedStoreAddress,
      publisherId: userId,
    };

    const newFeedkvStore: KeyValueStore<unknown> =
      await storeCacheContext.getStore({
        addressOrName: feedId,
        type: 'keyvalue',
        createParams: {
          accessController: {
            write: [userId],
          },
        },
      });
    await saveFeedKvStoreData(newFeedkvStore, feedKvStoreData);
    const feedKvStoreAddress = newFeedkvStore.address.toString();

    logger.debug(
      'Created root KV store for feed with address',
      feedKvStoreAddress
    );

    await addFeedToUserData(userKvStoreState.store, feedKvStoreAddress);

    return feedKvStoreAddress;
  };

  const deleteUserFeed = async (address: string) => {
    // Check identity as we're executing a write op
    if (
      userId == null ||
      orbitDbContext.identity == null ||
      userId !== orbitDbContext.identity.id
    ) {
      logger.error('Required identity is not initialized, aborting');
      return;
    }

    if (userKvStoreState.store == null) {
      logger.error('No user KV store exists, aborting');
      return;
    }

    const feedStore = loadedUserFeedStores[address];

    if (feedStore == null) {
      logger.warn("Attempting to delete a feed that doesn't exist", address);
      return;
    }

    // Delete all local data
    await feedStore.drop();
    // Delete from cache
    storeCacheContext?.removeStore(feedStore);

    // Remove from user data
    await deleteFeedFromUserData(userKvStoreState.store, address);
  };

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
    createUserFeed,
    deleteUserFeed(address: string): Promise<void> {
      return Promise.resolve(undefined);
    },
  };

  return hookData;
};

export default useRegistryUserUtils;
