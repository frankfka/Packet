import { Button, Paper } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import AppPage from '../../../components/AppPage/AppPage';
import CenteredInfoContainer from '../../../components/CenteredInfoContainer/CenteredInfoContainer';
import { useFeedStore } from '../../../context/orbitDb/feedStore/useFeedStore';
import { useKvStore } from '../../../context/orbitDb/kvStore/useKvStore';
import { useRegistryApp } from '../../../context/registryApp/registryAppContext';
import FeedKvStoreData from '../../../util/orbitDb/feed/FeedKvStoreData';
import {
  FeedPostData,
  JsonFeedPostData,
} from '../../../util/orbitDb/feed/FeedPostData';
import { addPostToFeedStore } from '../../../util/orbitDb/feed/postFeedStoreUtils';
import { GetFeedStoreParams } from '../../../util/orbitDb/orbitDbFeedStoreUtils';
import { GetKvStoreParams } from '../../../util/orbitDb/orbitDbKvStoreUtils';

type Props = {
  feedRootKvStoreAddress: string;
};

const RegistryFeedPage: React.FC<Props> = ({ feedRootKvStoreAddress }) => {
  const [feedKvStoreParams, setFeedKvStoreParams] =
    useState<GetKvStoreParams>();
  const [postsFeedStoreParams, setPostsFeedStoreParams] =
    useState<GetFeedStoreParams>();

  // Context
  const registryAppContext = useRegistryApp();

  const postsFeedStoreState =
    useFeedStore<JsonFeedPostData>(postsFeedStoreParams);
  const feedRootKvStoreState = useKvStore<FeedKvStoreData>(feedKvStoreParams);

  useEffect(() => {
    if (registryAppContext.userId == null) {
      setFeedKvStoreParams(undefined);
      setPostsFeedStoreParams(undefined);
      return;
    }

    setFeedKvStoreParams({ addressOrName: feedRootKvStoreAddress });
  }, [feedRootKvStoreAddress, registryAppContext.userId]);

  useEffect(() => {
    const postsDbAddress = feedRootKvStoreState.storeData?.postsDbAddress;

    if (postsDbAddress == null) {
      setPostsFeedStoreParams(undefined);
      return;
    }

    setPostsFeedStoreParams({ addressOrName: postsDbAddress });
  }, [feedRootKvStoreState.storeData?.postsDbAddress]);

  // TODO: Remove me
  useEffect(() => {
    registryAppContext.requestOrbitIdentity();
  }, []);

  let pageContent: React.ReactElement | undefined = undefined;

  const isLoading =
    !registryAppContext.isReady ||
    registryAppContext.loadingUserData ||
    postsFeedStoreState.isLoadingStore ||
    feedRootKvStoreState.isLoadingStore;
  if (isLoading) {
    // TODO: Loading
    pageContent = (
      <CenteredInfoContainer>
        <div>LOADING</div>
      </CenteredInfoContainer>
    );
  } else if (!!feedRootKvStoreState.storeData?.name) {
    const testOnClick = async () => {
      if (postsFeedStoreState.store == null) {
        console.error('Posts store is null');
        return;
      }

      const testData: FeedPostData = {
        content: 'Hello World',
        createdAt: new Date(),
        title: 'Hello World',
      };
      console.error(postsFeedStoreState.store);
      const hash = await addPostToFeedStore(
        postsFeedStoreState.store,
        testData
      );

      console.error('Added doc with hash', hash);
    };
    pageContent = (
      <div>
        <h4>Root Store</h4>
        <pre>{JSON.stringify(feedRootKvStoreState.storeData, null, 2)}</pre>
        <h4>Posts Store</h4>
        <pre>{JSON.stringify(postsFeedStoreState.storeData, null, 2)}</pre>
        <Button onClick={testOnClick}>Click Me</Button>
      </div>
    );
  } else {
    // TODO: Handle error
  }

  return (
    <AppPage>
      <Paper>{pageContent}</Paper>
    </AppPage>
  );
};

export default RegistryFeedPage;
