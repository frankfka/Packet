import {
  Avatar,
  Button,
  createStyles,
  makeStyles,
  Paper,
  Typography,
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import AppPage from '../../../components/AppPage/AppPage';
import BackButton from '../../../components/BackButton/BackButton';
import CenteredInfoContainer from '../../../components/CenteredInfoContainer/CenteredInfoContainer';
import ErrorView from '../../../components/ErrorView/ErrorView';
import LoadingView from '../../../components/LoadingView/LoadingView';
import SpacingContainer from '../../../components/SpacingContainer/SpacingContainer';
import TextFieldWithCopy from '../../../components/TextFieldWithCopy/TextFieldWithCopy';
import { useOrbitDbFeedStore } from '../../../context/orbitDb/useOrbitDbFeedStore';
import { useOrbitDbKvStore } from '../../../context/orbitDb/useOrbitDbKvStore';
import { useRegistryApp } from '../../../context/registryApp/registryAppContext';
import getFeedAvatarPlaceholderName from '../../../util/getFeedAvatarPlaceholderName';
import {
  FeedKvStoreData,
  FeedPostData,
  JsonFeedPostData,
} from '../../../util/orbitDb/feed/FeedDataTypes';
import { addPostToFeedStore } from '../../../util/orbitDb/feed/postFeedStoreUtils';
import { GetOrbitDbStoreParams } from '../../../util/orbitDb/OrbitDbTypes';
import CreatePostDialog from './CreatePostDialog/CreatePostDialog';
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

  const [showCreatePostDialog, setShowCreatePostDialog] = useState(false);

  const [feedKvStoreParams, setFeedKvStoreParams] =
    useState<Omit<GetOrbitDbStoreParams, 'type'>>();
  const [postsFeedStoreParams, setPostsFeedStoreParams] =
    useState<Omit<GetOrbitDbStoreParams, 'type'>>();

  // Context
  const registryAppContext = useRegistryApp();

  // The stores associated with a feed
  const postsFeedStoreState =
    useOrbitDbFeedStore<JsonFeedPostData>(postsFeedStoreParams);
  const feedRootKvStoreState =
    useOrbitDbKvStore<FeedKvStoreData>(feedKvStoreParams);

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
    postsFeedStoreState.isLoadingStore ||
    feedRootKvStoreState.isLoadingStore;

  const hasError =
    postsFeedStoreState.initError || feedRootKvStoreState.initError;

  const hasFeedInfo =
    feedRootKvStoreState.storeData != null &&
    Object.keys(feedRootKvStoreState.storeData).length > 0;

  // Handler for creating a post
  const createPost = async (
    title: string,
    content: string
  ): Promise<string | undefined> => {
    if (hasError || !hasFeedInfo || isLoading) {
      console.error('Attempted to create a post when not ready');
      return;
    }

    if (postsFeedStoreState.store == null) {
      console.error('Posts feed store is null');
      return;
    }

    const postData: FeedPostData = {
      title: title,
      content: content,
      createdAt: new Date(),
    };
    return addPostToFeedStore(postsFeedStoreState.store, postData);
  };

  // Loading & error views
  let loadingAndErrorContent: React.ReactElement | undefined = undefined;
  if (isLoading) {
    loadingAndErrorContent = <LoadingView py={35} />;
  } else if (hasError) {
    loadingAndErrorContent = <ErrorView py={35} />;
  }

  // Main page content for feed info (from KV store)
  let feedInfoContent: React.ReactElement | undefined = undefined;
  if (!isLoading && hasFeedInfo && feedRootKvStoreState.storeData != null) {
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
  if (!isLoading && hasFeedInfo && postsFeedStoreState.storeData) {
    const openCreatePostDialog = () => setShowCreatePostDialog(true);
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
            onClick={openCreatePostDialog}
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
            <NoPostsContent onCreatePostClicked={openCreatePostDialog} />
          )}
        </Paper>
      </div>
    );
  }

  return (
    <AppPage>
      {/*Create Post Dialog*/}
      <CreatePostDialog
        isOpen={showCreatePostDialog}
        setIsOpen={setShowCreatePostDialog}
        createPost={createPost}
      />

      {/*Main Content*/}
      <SpacingContainer direction="column" spacing={4}>
        <BackButton text="Dashboard" />
        {loadingAndErrorContent}
        {feedInfoContent}
        {feedPostsContent}
      </SpacingContainer>
    </AppPage>
  );
};

export default RegistryFeedPage;
