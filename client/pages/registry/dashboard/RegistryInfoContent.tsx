import { Button, Typography } from '@material-ui/core';
import React from 'react';
import CenteredInfoContainer from '../../../components/CenteredInfoContainer/CenteredInfoContainer';

export const NoWeb3ProviderContent: React.FC = () => {
  return (
    <CenteredInfoContainer>
      <Typography variant="h4" paragraph>
        No Web3 Wallet Detected
      </Typography>
      <Button
        href="https://metamask.io/"
        target="_blank"
        variant="contained"
        size="large"
        color="secondary"
      >
        Get MetaMask
      </Button>
    </CenteredInfoContainer>
  );
};

type NoConnectedAccountContentProps = {
  onConnectAccountClicked(): void;
};
export const NoConnectedAccountContent: React.FC<NoConnectedAccountContentProps> =
  ({ onConnectAccountClicked }) => {
    return (
      <CenteredInfoContainer>
        <Typography variant="h4" paragraph>
          No Account Connected
        </Typography>
        <Typography variant="subtitle1" paragraph>
          Get started by connecting your Ethereum wallet.
        </Typography>
        <Button
          onClick={onConnectAccountClicked}
          variant="contained"
          size="large"
          color="secondary"
        >
          Connect
        </Button>
      </CenteredInfoContainer>
    );
  };

type NoUserFeedsContentProps = {
  onCreateFeedClicked(): void;
};

export const NoUserFeedsContent: React.FC<NoUserFeedsContentProps> = ({
  onCreateFeedClicked,
}) => {
  return (
    <CenteredInfoContainer>
      <Typography variant="h4" paragraph>
        No Feeds
      </Typography>
      <Button
        onClick={onCreateFeedClicked}
        variant="contained"
        size="large"
        color="secondary"
      >
        Create a Feed
      </Button>
    </CenteredInfoContainer>
  );
};
