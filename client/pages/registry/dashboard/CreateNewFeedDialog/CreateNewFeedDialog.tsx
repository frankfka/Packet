import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  makeStyles,
  TextField,
  Typography,
} from '@material-ui/core';
import React, { useState } from 'react';
import RequestIdentityNotice from '../../../../components/RequestIdentityNotice/RequestIdentityNotice';
import SpacingContainer from '../../../../components/SpacingContainer/SpacingContainer';
import { useRegistryApp } from '../../../../context/registryApp/registryAppContext';
import CreateNewFeedSuccess from './CreateNewFeedSuccess';

type Props = {
  isOpen: boolean;
  setIsOpen(v: boolean): void;
};

const useStyles = makeStyles((theme) => ({
  dialogContent: {
    margin: theme.spacing(0, 2, 2, 2),
    overflowY: 'hidden',
  },
  spacingContainerItem: {
    textAlign: 'center',
    width: '100%',
  },
}));

const CreateNewFeedDialog: React.FC<Props> = ({ isOpen, setIsOpen }) => {
  const classes = useStyles();

  const { isOrbitIdentityInitialized, requestOrbitIdentity, createUserFeed } =
    useRegistryApp();

  const [createdAddress, setCreatedAddress] = useState<string>();
  const [isCreating, setIsCreating] = useState(false);
  const [feedName, setFeedName] = useState(''); // No validation yet

  const disableCreateButton =
    !isOrbitIdentityInitialized || isCreating || !feedName;

  const closeDialog = () => {
    // Reset all state
    setIsCreating(false);
    setCreatedAddress(undefined);
    setFeedName('');
    setIsOpen(false);
  };

  const onCreateClicked = async () => {
    setIsCreating(true);
    const createdFeedAddress = await createUserFeed(feedName);
    setIsCreating(false);

    if (createdFeedAddress) {
      setCreatedAddress(createdFeedAddress);
    }
  };

  // Child elements
  const dialogContent = createdAddress ? (
    <>
      <CreateNewFeedSuccess createdFeedAddress={createdAddress} />
      <Box textAlign="center">
        <Button onClick={closeDialog} color="primary" variant="outlined">
          Close
        </Button>
      </Box>
    </>
  ) : (
    <SpacingContainer itemClassName={classes.spacingContainerItem} spacing={3}>
      <Box>
        <Typography variant="h4">Create a Feed</Typography>
        <Typography variant="subtitle1">
          Specify a name for your feed to get started.
        </Typography>
      </Box>
      {!isOrbitIdentityInitialized && (
        <RequestIdentityNotice onLoadIdentityClicked={requestOrbitIdentity} />
      )}
      <TextField
        label="Feed Name"
        variant="outlined"
        fullWidth
        disabled={!isOrbitIdentityInitialized}
        value={feedName}
        onChange={(e) => setFeedName(e.currentTarget.value)}
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
