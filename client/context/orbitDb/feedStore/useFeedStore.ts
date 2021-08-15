import FeedStore from 'orbit-db-feedstore';
import { useEffect, useState } from 'react';
import getLogger from '../../../../util/getLogger';
import {
  GetFeedStoreParams,
  OrbitFeedDocsKeyedByHash,
} from '../../../util/orbitDb/orbitDbFeedStoreUtils';
import { useStoreCache } from '../storeCacheContext';

export const logger = getLogger('UseFeedStore');

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
export const useFeedStore = <TDocType>(
  params?: GetFeedStoreParams
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
  const reloadStoreData = async () => {
    logger.debug('Reloading store data');

    if (feedStore) {
      await feedStore.load();
      const newData = feedStore
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

  // Create the Feed store
  useEffect(() => {
    // Reset all state
    resetState();

    if (storeCacheContext == null || params == null) return;

    let cancelled = false;

    const getStore = async () => {
      logger.debug('Getting store with params', params);

      setIsLoadingStore(true);
      try {
        const store = await storeCacheContext.getFeedStore<TDocType>(params);

        if (cancelled) return;

        logger.debug('Retrieved Feed store', store);

        setFeedStore(store);
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
    };
  }, [storeCacheContext, params]);

  // Initialize listeners when store is retrieved
  useEffect(() => {
    if (feedStore == null) return;

    logger.debug('Listening to events');

    // Load store data on init
    reloadStoreData();

    // Occurs when replication is in-progress
    feedStore.events.on('replicate', (address) => {
      logger.debug('db.events.replicate', address.toString());
    });

    // Occurs when replication is done
    feedStore.events.on('replicated', (address) => {
      logger.debug('db.events.replicated', address.toString());
      reloadStoreData();
    });

    // Occurs when a new operation is executed
    feedStore.events.on('write', (address, entry) => {
      logger.debug('db.events.write', address.toString(), 'Entry', entry);
      reloadStoreData();
    });

    // Occurs when a peer connects
    feedStore.events.on('peer', (peer) => {
      logger.debug('db.events.peer', peer);
    });

    return () => {
      logger.debug('Cleaning up current Feed store');
      resetState();
      feedStore.events.removeAllListeners();
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
