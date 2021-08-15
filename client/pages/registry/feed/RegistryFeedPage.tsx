import {
  Avatar,
  Button,
  createStyles,
  makeStyles,
  Paper,
  Typography,
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import AppPage from '../../../components/AppPage/AppPage';
import CenteredInfoContainer from '../../../components/CenteredInfoContainer/CenteredInfoContainer';
import SpacingContainer from '../../../components/SpacingContainer/SpacingContainer';
import TextFieldWithCopy from '../../../components/TextFieldWithCopy/TextFieldWithCopy';
import { useFeedStore } from '../../../context/orbitDb/feedStore/useFeedStore';
import { useKvStore } from '../../../context/orbitDb/kvStore/useKvStore';
import { useRegistryApp } from '../../../context/registryApp/registryAppContext';
import getFeedAvatarPlaceholderName from '../../../util/getFeedAvatarPlaceholderName';
import FeedKvStoreData from '../../../util/orbitDb/feed/FeedKvStoreData';
import { JsonFeedPostData } from '../../../util/orbitDb/feed/FeedPostData';
import { GetFeedStoreParams } from '../../../util/orbitDb/orbitDbFeedStoreUtils';
import { GetKvStoreParams } from '../../../util/orbitDb/orbitDbKvStoreUtils';
import RegistryFeedPostsList from './RegistryFeedPostsList/RegistryFeedPostsList';

type Props = {
  feedRootKvStoreAddress: string;
};

const useStyles = makeStyles((theme) =>
  createStyles({
    feedInfoContainer: {
      textAlign: 'center',
      padding: theme.spacing(8, 4),
    },
    feedInfoAvatar: {
      margin: 'auto',
      width: 128,
      height: 128,
      fontSize: 64,
    },
    feedInfoAddressTextField: {
      width: '80%',
    },
    feedPostsTitleContainer: {
      margin: theme.spacing(2, 0, 1, 0),
    },
  })
);

type NoPostsContentProps = {
  onCreatePostClicked(): void;
};
const NoPostsContent: React.FC<NoPostsContentProps> = ({
  onCreatePostClicked,
}) => {
  return (
    <CenteredInfoContainer>
      <Typography variant="h4" paragraph>
        No Posts
      </Typography>
      <Button
        onClick={onCreatePostClicked}
        variant="contained"
        size="large"
        color="secondary"
      >
        Create a Post
      </Button>
    </CenteredInfoContainer>
  );
};

const RegistryFeedPage: React.FC<Props> = ({ feedRootKvStoreAddress }) => {
  const classes = useStyles();
  const router = useRouter();

  const [feedKvStoreParams, setFeedKvStoreParams] =
    useState<GetKvStoreParams>();
  const [postsFeedStoreParams, setPostsFeedStoreParams] =
    useState<GetFeedStoreParams>();

  // Context
  const registryAppContext = useRegistryApp();

  // The stores associated with a feed
  const postsFeedStoreState =
    useFeedStore<JsonFeedPostData>(postsFeedStoreParams);
  const feedRootKvStoreState = useKvStore<FeedKvStoreData>(feedKvStoreParams);

  // Reload root feed KV store
  useEffect(() => {
    if (registryAppContext.userId == null) {
      setFeedKvStoreParams(undefined);
      setPostsFeedStoreParams(undefined);
      return;
    }

    setFeedKvStoreParams({ addressOrName: feedRootKvStoreAddress });
  }, [feedRootKvStoreAddress, registryAppContext.userId]);

  // Reload posts feed store
  useEffect(() => {
    const postsDbAddress = feedRootKvStoreState.storeData?.postsDbAddress;

    if (postsDbAddress == null) {
      setPostsFeedStoreParams(undefined);
      return;
    }

    setPostsFeedStoreParams({ addressOrName: postsDbAddress });
  }, [feedRootKvStoreState.storeData?.postsDbAddress]);

  const isLoading =
    !registryAppContext.isReady ||
    registryAppContext.loadingUserData ||
    postsFeedStoreState.isLoadingStore;

  const hasError =
    postsFeedStoreState.initError || feedRootKvStoreState.initError;

  // TODO: Loading && error views
  let pageInfoContent: React.ReactElement | undefined = undefined;
  if (isLoading) {
    pageInfoContent = (
      <CenteredInfoContainer>
        <div>LOADING</div>
      </CenteredInfoContainer>
    );
  } else if (hasError) {
    pageInfoContent = (
      <CenteredInfoContainer>
        <div>ERROR</div>
      </CenteredInfoContainer>
    );
  }

  const hasFeedInfo =
    feedRootKvStoreState.storeData != null &&
    Object.keys(feedRootKvStoreState.storeData).length > 0;
  // Main page content for feed info (from KV store)
  let feedInfoContent: React.ReactElement | undefined = undefined;
  if (hasFeedInfo && feedRootKvStoreState.storeData != null) {
    const { name, iconUri } = feedRootKvStoreState.storeData;
    feedInfoContent = (
      <Paper>
        <SpacingContainer
          direction="column"
          className={classes.feedInfoContainer}
        >
          <Avatar
            alt={`${name} feed icon`}
            src={iconUri}
            className={classes.feedInfoAvatar}
          >
            {getFeedAvatarPlaceholderName(name)}
          </Avatar>
          <Typography variant="h3">{name}</Typography>
          <TextFieldWithCopy
            value={feedRootKvStoreAddress}
            readOnly
            variant="outlined"
            label="Feed Address"
            fullWidth
            className={classes.feedInfoAddressTextField}
          />
        </SpacingContainer>
      </Paper>
    );
  }

  // Main page content for feed posts
  let feedPostsContent: React.ReactElement | undefined = undefined;
  if (hasFeedInfo && postsFeedStoreState.storeData) {
    // TODO: also need to do loading state for feed posts
    feedPostsContent = (
      <div>
        <SpacingContainer
          alignItems="center"
          justifyContent="space-between"
          className={classes.feedPostsTitleContainer}
        >
          <Typography variant="h5">Posts</Typography>
          <Button
            disabled={false}
            onClick={() => {}}
            color="secondary"
            startIcon={<AddIcon />}
            variant="outlined"
            size="large"
          >
            New
          </Button>
        </SpacingContainer>

        <Paper>
          {Object.keys(postsFeedStoreState.storeData).length > 0 ? (
            <RegistryFeedPostsList
              posts={postsFeedStoreState.storeData}
              rootFeedStoreAddress={feedRootKvStoreAddress}
            />
          ) : (
            <NoPostsContent onCreatePostClicked={() => {}} />
          )}
          <pre>{JSON.stringify(postsFeedStoreState.storeData, null, 2)}</pre>
        </Paper>
      </div>
    );
  }

  return (
    <AppPage>
      <SpacingContainer direction="column" spacing={4}>
        <div>
          <Button
            variant="text"
            startIcon={<ChevronLeftIcon />}
            size="large"
            onClick={() => router.back()}
          >
            Dashboard
          </Button>
        </div>
        {pageInfoContent}
        {feedInfoContent}
        {feedPostsContent}
      </SpacingContainer>
    </AppPage>
  );
};

export default RegistryFeedPage;
