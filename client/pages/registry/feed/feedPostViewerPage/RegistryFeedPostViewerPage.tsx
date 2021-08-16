import { createStyles, makeStyles, Paper, Typography } from '@material-ui/core';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import Editor from 'rich-markdown-editor';
import AppPage from '../../../../components/AppPage/AppPage';
import BackButton from '../../../../components/BackButton/BackButton';
import SpacingContainer from '../../../../components/SpacingContainer/SpacingContainer';
import { useOrbitDbFeedStore } from '../../../../context/orbitDb/useOrbitDbFeedStore';
import { useOrbitDbKvStore } from '../../../../context/orbitDb/useOrbitDbKvStore';
import FeedKvStoreData from '../../../../util/orbitDb/feed/FeedKvStoreData';
import { JsonFeedPostData } from '../../../../util/orbitDb/feed/FeedPostData';
import { GetFeedStoreParams } from '../../../../util/orbitDb/orbitDbFeedStoreUtils';
import { GetKvStoreParams } from '../../../../util/orbitDb/orbitDbKvStoreUtils';

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
  const router = useRouter();

  // TODO: We can remove this after creating `useFeedStore`
  const [feedKvStoreParams, setFeedKvStoreParams] = useState<GetKvStoreParams>({
    addressOrName: feedRootKvStoreAddress,
  });
  const [postsFeedStoreParams, setPostsFeedStoreParams] =
    useState<GetFeedStoreParams>();

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
        {postData && (
          <SpacingContainer direction="column">
            <Typography variant="h3">{postData.title}</Typography>
            <Typography variant="caption">{postData.createdAt}</Typography>
            <Paper className={classes.postContentContainer}>
              <Editor readOnly defaultValue={postData.content} />
            </Paper>
          </SpacingContainer>
        )}
      </SpacingContainer>
    </AppPage>
  );
};

export default RegistryFeedPage;
