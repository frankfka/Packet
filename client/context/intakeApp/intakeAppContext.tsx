import FeedStore from 'orbit-db-feedstore';
import KeyValueStore from 'orbit-db-kvstore';
import React, { createContext, useContext, useEffect, useState } from 'react';
import getLogger from '../../../util/getLogger';
import { JsonFeedPostData } from '../../util/orbitDb/feed/FeedDataTypes';
import {
  getFeedKvStoreData,
  getPostsFromFeedStore,
} from '../../util/orbitDb/feed/postFeedStoreUtils';
import {
  initOrbitDbStoreListeners,
  removeOrbitDbStoreListeners,
} from '../../util/orbitDb/orbitDbStoreUtils';
import { useStoreCache } from '../orbitDb/storeCacheContext';
import { SubscribedFeedData, SubscribedFeedStore } from './IntakeAppTypes';
import { isFeedInfoLoaded } from './intakeAppUtils';
import useIntakeUserUtils from './useIntakeUserUtils';

const logger = getLogger('IntakeApp-Context', 'debug');

type IntakeAppContextData = {
  // User State
  isLoadingUser: boolean;
  // Subscribed posts state
  isLoadingSubscriptions: boolean;
  subscriptions: Record<string, SubscribedFeedData>;
  subscriptionStores?: Record<string, SubscribedFeedStore>;
  // Exposed functions
  addSubscription(feedAddress: string): Promise<void>;
  removeSubscription(feedAddress: string): Promise<void>;
};

export const IntakeAppContext = createContext<IntakeAppContextData>({
  isLoadingUser: false,
  isLoadingSubscriptions: false,
  subscriptions: {},
  async addSubscription() {},
  async removeSubscription() {},
});

export const IntakeAppContextProvider: React.FC = ({ children }) => {
  const storeCache = useStoreCache();
  const [loadingSubscriptions, setIsLoadingSubscriptions] = useState(false);
  // Stores
  const [subscribedFeedStores, setSubscribedFeedStores] =
    useState<Record<string, SubscribedFeedStore>>();
  // Store data
  const [subscriptionData, setSubscriptionData] = useState<
    Record<string, SubscribedFeedData>
  >({});

  /*
  User
   */
  const intakeUserState = useIntakeUserUtils();

  /**
   * Subscriptions
   */

  /*
  Util Methods
   */

  // Utils for reloading data from store
  const reloadDataForRootFeedStore = async (
    rootAddress: string,
    store: KeyValueStore<unknown>
  ) => {
    await store.load();
    const newFeedInfo = getFeedKvStoreData(store);

    logger.debug('Reloading data for root feed KV store', newFeedInfo);

    if (!isFeedInfoLoaded(newFeedInfo)) {
      logger.debug('Incomplete feed info, aborting setting data');
      return;
    }

    // Set new data
    setSubscriptionData((prevState) => {
      const newFeedData = {
        posts:
          prevState[rootAddress] != null ? prevState[rootAddress].posts : {},
        feedInfo: newFeedInfo,
      };

      return {
        ...prevState,
        [rootAddress]: newFeedData,
      };
    });

    // If we don't have a post store, we need to initialize it
    if (
      subscribedFeedStores != null &&
      subscribedFeedStores[rootAddress].postsStore == null &&
      !!newFeedInfo.postsDbAddress
    ) {
      const postsStore = await storeCache.getStore<FeedStore<JsonFeedPostData>>(
        {
          addressOrName: newFeedInfo.postsDbAddress,
          type: 'feed',
        }
      );
      // Add listeners
      addListenersToPostsFeedStore(rootAddress, postsStore);
      // Set to state
      subscribedFeedStores[rootAddress].postsStore = postsStore;
      // Reload data
      await reloadDataForPostsFeedStore(rootAddress, postsStore);
    }
  };
  const reloadDataForPostsFeedStore = async (
    rootAddress: string,
    store: FeedStore<JsonFeedPostData>
  ) => {
    await store.load();
    logger.debug('Reloading data for posts feed store');

    setSubscriptionData((prevState) => {
      if (prevState[rootAddress] == null) {
        throw Error(
          "Attempting to load posts into data that doesn't have the root address initialized"
        );
      }

      const newPosts = getPostsFromFeedStore(store);
      const newFeedData = {
        posts: newPosts,
        feedInfo: prevState[rootAddress].feedInfo,
      };

      return {
        ...prevState,
        [rootAddress]: newFeedData,
      };
    });
  };

  // Utils for attaching listeners
  const addListenersToRootFeedStore = (
    rootAddress: string,
    store: KeyValueStore<unknown>
  ) => {
    initOrbitDbStoreListeners(store, {
      replicated: () => reloadDataForRootFeedStore(rootAddress, store),
      write: () => reloadDataForRootFeedStore(rootAddress, store),
      peer: (address) => logger.debug('Root feed store peer:', address),
    });
  };

  const addListenersToPostsFeedStore = (
    rootAddress: string,
    store?: FeedStore<JsonFeedPostData>
  ) => {
    if (store == null) return;

    initOrbitDbStoreListeners(store, {
      replicated: () => reloadDataForPostsFeedStore(rootAddress, store),
      write: () => reloadDataForPostsFeedStore(rootAddress, store),
      peer: (address) => logger.debug('Posts feed store peer:', address),
    });
  };

  /*
  Subscriptions
  - Load all stores on first load (we'll handle add / remove manually in the exposed functions)
   */
  const userLoaded = intakeUserState.user != null;

  const loadFeedStores = async (
    rootFeedAddress: string
  ): Promise<{
    stores: SubscribedFeedStore;
    data?: SubscribedFeedData;
  }> => {
    const rootFeedStore = await storeCache.getStore<KeyValueStore<unknown>>({
      addressOrName: rootFeedAddress,
      type: 'keyvalue',
    });
    await rootFeedStore.load();

    // Get root store data
    const rootFeedStoreData = getFeedKvStoreData(rootFeedStore);

    if (Object.keys(rootFeedStoreData).length === 0) {
      // Need to wait for replication, skip this and wait for useEffect below to listen for `replicated` event
      logger.debug('No root store data loaded yet, waiting for replication');
      return {
        stores: {
          feedInfoStore: rootFeedStore,
        },
      };
    }

    logger.debug(
      'Posts store available, loading',
      rootFeedStoreData.postsDbAddress
    );
    // Get posts store
    const postsStore = await storeCache.getStore<FeedStore<JsonFeedPostData>>({
      addressOrName: rootFeedStoreData.postsDbAddress,
      type: 'feed',
    });
    await postsStore.load();

    // Get posts store data
    const postsStoreData = getPostsFromFeedStore(postsStore);

    logger.debug('Load feed stores complete');

    return {
      stores: {
        feedInfoStore: rootFeedStore,
        postsStore: postsStore,
      },
      data: {
        feedInfo: rootFeedStoreData,
        posts: postsStoreData,
      },
    };
  };

  useEffect(() => {
    let cancelled = false;
    const inProgressStoreData: Record<string, SubscribedFeedData> = {};
    const inProgressStores: Record<string, SubscribedFeedStore> = {};

    const loadInitialSubscriptions = async () => {
      if (storeCache.isLoading || intakeUserState.user == null) {
        return;
      }

      logger.debug('Loading initial subscriptions');
      setIsLoadingSubscriptions(true);

      for (const rootFeedAddress of intakeUserState.user
        .subscribedFeedAddresses) {
        if (cancelled) break;

        const loadResult = await loadFeedStores(rootFeedAddress);

        // Add to stores
        inProgressStores[rootFeedAddress] = loadResult.stores;
        // Add to data
        if (loadResult.data != null) {
          inProgressStoreData[rootFeedAddress] = loadResult.data;
        }
      }

      // Commit in progress to state
      setSubscribedFeedStores(inProgressStores);
      setSubscriptionData(inProgressStoreData);
      setIsLoadingSubscriptions(false);

      logger.debug('Finished loading initial subscriptions');
    };

    loadInitialSubscriptions();

    return () => {
      cancelled = true;
    };
  }, [storeCache.isLoading, userLoaded]);

  // Initialize listeners when feed stores load

  useEffect(() => {
    if (subscribedFeedStores == null) return;
    const storesRef = subscribedFeedStores;

    logger.debug('Initializing listeners for feed stores');

    Object.keys(storesRef).forEach((rootAddress) => {
      const stores = storesRef[rootAddress];
      const feedInfoStore = stores.feedInfoStore;
      const postsStore = stores.postsStore;

      addListenersToRootFeedStore(rootAddress, feedInfoStore);
      addListenersToPostsFeedStore(rootAddress, postsStore);
    });

    return () => {
      Object.values(storesRef).forEach((stores) => {
        if (stores.postsStore != null) {
          removeOrbitDbStoreListeners(stores.postsStore);
        }
        removeOrbitDbStoreListeners(stores.feedInfoStore);
      });
    };
  }, [subscribedFeedStores]);

  // Add & remove subscription handlers
  const addSubscription = async (feedAddress: string): Promise<void> => {
    if (subscribedFeedStores == null) {
      logger.error(
        'Attempting to add subscription when feed stores are not initialized'
      );
      return;
    }

    // Add to user
    intakeUserState.addSubscription(feedAddress);
    // Update subscription stores with listeners
    const loadResult = await loadFeedStores(feedAddress);

    addListenersToRootFeedStore(feedAddress, loadResult.stores.feedInfoStore);
    addListenersToPostsFeedStore(feedAddress, loadResult.stores.postsStore);
    subscribedFeedStores[feedAddress] = loadResult.stores;

    const loadedData = loadResult.data;
    if (loadedData != null) {
      // Add to data
      setSubscriptionData((prevState) => {
        return {
          ...prevState,
          [feedAddress]: loadedData,
        };
      });
    } else {
      setSubscriptionData((prevState) => {
        return {
          ...prevState,
        };
      });
    }
  };

  const removeSubscription = async (feedAddress: string): Promise<void> => {
    if (subscribedFeedStores == null) {
      logger.error(
        'Attempting to remove subscription when feed stores are not initialized'
      );
      return;
    }
    // Remove from user
    intakeUserState.removeSubscription(feedAddress);

    const feedInfoStore = subscribedFeedStores[feedAddress].feedInfoStore;
    const feedPostsStore = subscribedFeedStores[feedAddress].postsStore;

    // Remove listeners and from stores
    removeOrbitDbStoreListeners(feedInfoStore);
    storeCache.removeStore(feedInfoStore);

    if (feedPostsStore != null) {
      storeCache.removeStore(feedPostsStore);
      removeOrbitDbStoreListeners(feedPostsStore);
    }

    // Remove from state
    delete subscribedFeedStores[feedAddress];
    // Remove data
    setSubscriptionData((prevState) => {
      delete prevState[feedAddress];
      return {
        ...prevState,
      };
    });
  };

  // Create context data
  const contextData: IntakeAppContextData = {
    isLoadingUser: intakeUserState.isLoadingUser,
    isLoadingSubscriptions: loadingSubscriptions || storeCache.isLoading,
    subscriptions: subscriptionData,
    subscriptionStores: subscribedFeedStores,
    addSubscription,
    removeSubscription,
  };

  return (
    <IntakeAppContext.Provider value={contextData}>
      {children}
    </IntakeAppContext.Provider>
  );
};

export const useIntakeApp = () => useContext(IntakeAppContext);
