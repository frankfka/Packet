import FeedStore from 'orbit-db-feedstore';
import { useEffect, useState } from 'react';
import getLogger from '../../../util/getLogger';
import {
  initOrbitDbStoreListeners,
  removeOrbitDbStoreListeners,
} from '../../util/orbitDb/orbitDbStoreUtils';
import {
  GetOrbitDbStoreParams,
  OrbitFeedDocsKeyedByHash,
} from '../../util/orbitDb/OrbitDbTypes';
import { useStoreCache } from './storeCacheContext';

export const logger = getLogger('UseOrbitDBFeedStore');

export type FeedStoreState<TDocType> = {
  isLoadingStore: boolean;
  store?: FeedStore<TDocType>;
  storeData?: OrbitFeedDocsKeyedByHash<TDocType>;
  reloadStoreData(): void;
  initError?: boolean;
};

/*
This is very similar to useKvStore, but we shouldn't generalize this to support
pagination
 */
export const useOrbitDbFeedStore = <TDocType>(
  params?: Omit<GetOrbitDbStoreParams, 'type'>
): FeedStoreState<TDocType> => {
  const storeCacheContext = useStoreCache();

  const [isLoadingStore, setIsLoadingStore] = useState(false);
  const [feedStore, setFeedStore] = useState<FeedStore<TDocType>>();
  const [feedStoreData, setFeedStoreData] = useState<
    OrbitFeedDocsKeyedByHash<TDocType>
  >({});
  const [storeInitError, setStoreInitError] = useState(false);

  // Resets state of the hook
  const resetState = () => {
    setIsLoadingStore(false);
    setFeedStoreData({});
    setFeedStore(undefined);
    setStoreInitError(false);
  };

  // Manually reloads all the data in the store
  const reloadStoreDataForStore = async (store?: FeedStore<TDocType>) => {
    logger.debug('Reloading store data');

    if (store) {
      await store.load();
      const newData = store
        .iterator({
          // TODO These should be extracted!
          limit: -1, // Get all documents
          reverse: true, // Most recent documents first
        })
        .collect()
        .reduce((obj: Record<string, TDocType>, entry) => {
          obj[entry.hash] = entry.payload.value as TDocType;
          return obj;
        }, {});
      setFeedStoreData(newData);
    } else {
      setFeedStoreData({});
    }
  };

  const reloadStoreData = async () => {
    await reloadStoreDataForStore(feedStore);
  };

  // Create the Feed store when the parameters or store cache changes
  useEffect(() => {
    // Reset all state
    resetState();

    if (storeCacheContext.isLoading || params == null) return;

    let cancelled = false;

    // Keep a reference for the cancel function
    let storeInstance: FeedStore<TDocType> | undefined = undefined;

    const getStore = async () => {
      logger.debug('Getting store with params', params);

      setIsLoadingStore(true);
      try {
        storeInstance = await storeCacheContext.getStore<FeedStore<TDocType>>({
          ...params,
          type: 'feed',
        });

        if (cancelled) return;

        logger.debug('Retrieved Feed store', storeInstance);

        // Setup listeners
        initOrbitDbStoreListeners(storeInstance, {
          replicated: (address) => {
            logger.debug('db.events.replicated', address.toString());
            reloadStoreDataForStore(storeInstance);
          },
          write: (address, entry) => {
            logger.debug('db.events.write', address.toString(), 'Entry', entry);
            reloadStoreDataForStore(storeInstance);
          },
        });

        setFeedStore(storeInstance);
      } catch (err) {
        logger.error('Error getting Feed store', err);

        if (cancelled) return;

        setStoreInitError(true);
      }
      setIsLoadingStore(false);
    };

    getStore();

    return () => {
      cancelled = true;
      if (storeInstance != null) {
        removeOrbitDbStoreListeners(storeInstance);
      }
    };
  }, [storeCacheContext, params]);

  // Load data and handle store cleanup
  useEffect(() => {
    if (feedStore == null) return;

    let storeRef = feedStore; // Keep a ref for cleanup function

    // Load store data on init
    reloadStoreDataForStore(storeRef);

    return () => {
      logger.debug('Cleaning up current Feed store');
      resetState();
      removeOrbitDbStoreListeners(storeRef);
    };
  }, [feedStore]);

  const state: FeedStoreState<TDocType> = {
    isLoadingStore,
    store: feedStore,
    storeData: feedStoreData,
    reloadStoreData,
    initError: storeInitError,
  };

  return state;
};
