import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  Link,
  makeStyles,
  TextField,
  Typography,
} from '@material-ui/core';
import React, { useState } from 'react';
import RequestIdentityNotice from '../../../../components/RequestIdentityNotice/RequestIdentityNotice';
import SpacingContainer from '../../../../components/SpacingContainer/SpacingContainer';
import { useRegistryApp } from '../../../../context/registryApp/registryAppContext';
import CreateNewPostSuccess from './CreateNewPostSuccess';
import fetchMarkdownFromIpfs from './fetchMarkdownFromIpfs';

type Props = {
  isOpen: boolean;
  setIsOpen(v: boolean): void;
  createPost(title: string, content: string): Promise<string | undefined>;
};

const useStyles = makeStyles((theme) => ({
  dialogContent: {
    margin: theme.spacing(0, 2, 2, 2),
    overflowY: 'hidden',
  },
  createPostDescription: {
    textAlign: 'start',
  },
  spacingContainerItem: {
    textAlign: 'center',
    width: '100%',
  },
}));

type CreateNewFeedContentHelperTextProps = {
  errorMessage?: string;
};

const CreateNewFeedContentHelperText: React.FC<CreateNewFeedContentHelperTextProps> =
  ({ errorMessage }) => {
    const content = errorMessage ? (
      <>{errorMessage}</>
    ) : (
      <>
        Create a Markdown post through{' '}
        <Link
          href="https://www.mkdn.link/"
          target="_blank"
          underline="always"
          color="secondary"
        >
          mkdn.link
        </Link>{' '}
        and paste the CID here.
      </>
    );

    return (
      <Typography
        variant="caption"
        color={errorMessage ? 'error' : 'textSecondary'}
      >
        {content}
      </Typography>
    );
  };

const CreateNewFeedDialog: React.FC<Props> = ({
  isOpen,
  setIsOpen,
  createPost,
}) => {
  const classes = useStyles();

  const { isOrbitIdentityInitialized, requestOrbitIdentity } = useRegistryApp();

  const [isCreating, setIsCreating] = useState(false);
  const [createSuccess, setCreateSuccess] = useState(false);

  const [postTitle, setPostTitle] = useState('');
  const [postContentCid, setPostContentCid] = useState('');
  const [postContentCidError, setPostContentCidError] = useState<string>();

  const disableCreateButton =
    !isOrbitIdentityInitialized || isCreating || !postTitle || !postContentCid;

  const closeDialog = () => {
    // Reset all state
    setPostContentCid('');
    setPostTitle('');
    setCreateSuccess(false);
    setPostContentCidError(undefined);
    setIsOpen(false);
  };

  const onCreateClicked = async () => {
    setIsCreating(true);

    // Try to fetch the CID
    let postContentMarkdown: string | undefined = undefined;
    try {
      postContentMarkdown = await fetchMarkdownFromIpfs(postContentCid);
    } catch (err) {
      console.error('Error fetching markdown', err);
      setPostContentCidError(
        'Markdown content could not be retrieved. Please check the CID.'
      );
    }

    if (!postContentMarkdown) {
      // Most likely a bad CID
      setIsCreating(false);
      return;
    }

    // Skipping try-catch here for now
    const hash = await createPost(postTitle, postContentMarkdown);
    setIsCreating(false);

    if (hash) {
      console.log('Success creating post. Hash:', hash);
      setCreateSuccess(true);
    } else {
      console.error('No hash resulted from trying to create post');
      // Close dialog for now
      closeDialog();
    }
  };

  const dialogContent = createSuccess ? (
    <>
      <CreateNewPostSuccess />
      <Box textAlign="center">
        <Button onClick={closeDialog} color="primary" variant="outlined">
          Close
        </Button>
      </Box>
    </>
  ) : (
    <SpacingContainer itemClassName={classes.spacingContainerItem} spacing={3}>
      <Box>
        <Typography variant="h4" paragraph>
          Create a Post
        </Typography>
        <Typography variant="body1" className={classes.createPostDescription}>
          Create a post by specifying a title and content in Markdown. We
          currently do not have editor support - please visit{' '}
          <Link
            href="https://www.mkdn.link/"
            target="_blank"
            color="secondary"
            underline="always"
          >
            mkdn.link
          </Link>{' '}
          to create your post and paste the CID below.
        </Typography>
      </Box>
      {!isOrbitIdentityInitialized && (
        <RequestIdentityNotice onLoadIdentityClicked={requestOrbitIdentity} />
      )}
      <TextField
        label="Post Title"
        variant="outlined"
        fullWidth
        disabled={!isOrbitIdentityInitialized}
        value={postTitle}
        onChange={(e) => setPostTitle(e.currentTarget.value)}
      />
      <TextField
        label="Post Content CID"
        error={!!postContentCidError}
        helperText={
          <CreateNewFeedContentHelperText errorMessage={postContentCidError} />
        }
        variant="outlined"
        fullWidth
        disabled={!isOrbitIdentityInitialized}
        value={postContentCid}
        onChange={(e) => setPostContentCid(e.currentTarget.value)}
      />
      <Button
        color="secondary"
        variant="contained"
        startIcon={isCreating && <CircularProgress size={24} />}
        disabled={disableCreateButton}
        onClick={onCreateClicked}
      >
        Create
      </Button>
    </SpacingContainer>
  );

  return (
    <Dialog open={isOpen} onClose={closeDialog}>
      <DialogContent className={classes.dialogContent}>
        {dialogContent}
      </DialogContent>
    </Dialog>
  );
};

export default CreateNewFeedDialog;
