import { Box, Button, makeStyles } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import React from 'react';

type Props = {
  helperText?: string;
  onLoadIdentityClicked(): void;
};

const useStyles = makeStyles((theme) => ({
  alertIcon: {
    alignItems: 'center',
  },
}));

const RequestIdentityNotice: React.FC<Props> = ({
  helperText,
  onLoadIdentityClicked,
}) => {
  const classes = useStyles();

  const noticeMessage =
    helperText ??
    'We need to authenticate with your Ethereum wallet before proceeding. You will be asked to sign a unique message to prove your identity.';

  return (
    <Alert
      severity="warning"
      action={
        <Button color="inherit" onClick={onLoadIdentityClicked}>
          <Box fontWeight="bold">Authenticate</Box>
        </Button>
      }
      classes={{
        icon: classes.alertIcon,
      }}
    >
      <Box textAlign="start">{noticeMessage}</Box>
    </Alert>
  );
};

export default RequestIdentityNotice;
