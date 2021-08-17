import { createStyles, makeStyles, Paper, Typography } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import Editor from 'rich-markdown-editor';
import AppPage from '../../../../components/AppPage/AppPage';
import BackButton from '../../../../components/BackButton/BackButton';
import LoadingView from '../../../../components/LoadingView/LoadingView';
import SpacingContainer from '../../../../components/SpacingContainer/SpacingContainer';
import { useOrbitDbFeedStore } from '../../../../context/orbitDb/useOrbitDbFeedStore';
import { useOrbitDbKvStore } from '../../../../context/orbitDb/useOrbitDbKvStore';
import { dateFromIsoString, formatDate } from '../../../../util/dateUtils';
import {
  FeedKvStoreData,
  JsonFeedPostData,
} from '../../../../util/orbitDb/feed/FeedDataTypes';
import { GetOrbitDbStoreParams } from '../../../../util/orbitDb/OrbitDbTypes';

type Props = {
  feedRootKvStoreAddress: string;
  postHash: string;
};

const useStyles = makeStyles((theme) =>
  createStyles({
    postContentContainer: {
      padding: theme.spacing(4),
    },
  })
);

const RegistryFeedPage: React.FC<Props> = ({
  feedRootKvStoreAddress,
  postHash,
}) => {
  const classes = useStyles();

  // TODO: We can remove this after creating `useFeedStore`
  const [feedKvStoreParams, setFeedKvStoreParams] = useState<
    Omit<GetOrbitDbStoreParams, 'type'>
  >({
    addressOrName: feedRootKvStoreAddress,
  });
  const [postsFeedStoreParams, setPostsFeedStoreParams] =
    useState<Omit<GetOrbitDbStoreParams, 'type'>>();

  // The stores associated with a feed
  const postsFeedStoreState =
    useOrbitDbFeedStore<JsonFeedPostData>(postsFeedStoreParams);
  const feedRootKvStoreState =
    useOrbitDbKvStore<FeedKvStoreData>(feedKvStoreParams);

  // Reload posts feed store
  useEffect(() => {
    const postsDbAddress = feedRootKvStoreState.storeData?.postsDbAddress;

    if (postsDbAddress == null) {
      setPostsFeedStoreParams(undefined);
      return;
    }

    setPostsFeedStoreParams({ addressOrName: postsDbAddress });
  }, [feedRootKvStoreState.storeData?.postsDbAddress]);

  const postData = postsFeedStoreState.storeData?.[postHash];

  // TODO: Loading
  return (
    <AppPage>
      <SpacingContainer direction="column" spacing={4}>
        <BackButton />
        {postData ? (
          <SpacingContainer direction="column">
            <Typography variant="h3">{postData.title}</Typography>
            <Typography variant="caption">
              {formatDate(dateFromIsoString(postData.createdAt))}
            </Typography>
            <Paper className={classes.postContentContainer}>
              <Editor readOnly defaultValue={postData.content} />
            </Paper>
          </SpacingContainer>
        ) : (
          <LoadingView py={35} />
        )}
      </SpacingContainer>
    </AppPage>
  );
};

export default RegistryFeedPage;
