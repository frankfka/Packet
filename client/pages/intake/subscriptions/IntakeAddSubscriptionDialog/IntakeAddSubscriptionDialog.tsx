import {
  Box,
  Button,
  Dialog,
  DialogContent,
  makeStyles,
  TextField,
  Typography,
} from '@material-ui/core';
import OrbitDB from 'orbit-db';
import React, { useState } from 'react';
import SpacingContainer from '../../../../components/SpacingContainer/SpacingContainer';

type Props = {
  isOpen: boolean;
  setIsOpen(v: boolean): void;
  onAddClicked(address: string): void;
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

const IntakeAddSubscriptionDialog: React.FC<Props> = ({
  isOpen,
  setIsOpen,
  onAddClicked,
}) => {
  const classes = useStyles();
  const [feedAddress, setFeedAddress] = useState<string>('');

  const closeDialog = () => {
    // Reset all state
    setFeedAddress('');
    setIsOpen(false);
  };

  const onAddSubscriptionClicked = () => {
    onAddClicked(feedAddress);
    closeDialog();
  };

  return (
    <Dialog open={isOpen} onClose={closeDialog}>
      <DialogContent className={classes.dialogContent}>
        <SpacingContainer
          itemClassName={classes.spacingContainerItem}
          spacing={3}
        >
          <Box>
            <Typography variant="h4">Add Subscription</Typography>
            <Typography variant="subtitle1">
              Specify the address of the feed below
            </Typography>
          </Box>
          <TextField
            label="Feed Address"
            variant="outlined"
            fullWidth
            value={feedAddress}
            onChange={(e) => setFeedAddress(e.currentTarget.value)}
          />
          <Button
            color="secondary"
            variant="contained"
            disabled={!feedAddress || !OrbitDB.isValidAddress(feedAddress)}
            onClick={onAddSubscriptionClicked}
          >
            Add
          </Button>
        </SpacingContainer>
      </DialogContent>
    </Dialog>
  );
};

export default IntakeAddSubscriptionDialog;
