import { Button, Paper, Typography } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import AppPage from '../../components/AppPage/AppPage';
import CenteredInfoContainer from '../../components/CenteredInfoContainer/CenteredInfoContainer';
import { useEthereumContext } from '../../context/ethereum/ethereumContext';
import { useRegistryApp } from '../../context/registryApp/registryAppContext';

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

function getRandomInt(max: number): string {
  return Math.floor(Math.random() * max).toFixed(0);
}

const RegistryDashboardPage = () => {
  const registryAppContext = useRegistryApp();
  const { providerAvailable } = useEthereumContext();

  let authInfoContent: React.ReactElement | undefined = undefined;

  // Render the appropriate content depending on the authentication state
  if (!providerAvailable) {
    authInfoContent = <NoWeb3ProviderContent />;
  } else if (registryAppContext.isReady && !registryAppContext.userId) {
    authInfoContent = (
      <NoConnectedAccountContent
        onConnectAccountClicked={() => registryAppContext.login()}
      />
    );
  }

  return (
    <AppPage>
      {/*Publications*/}
      <Typography variant="h3">Manage Publications</Typography>
      {/*Request for auth*/}
      <Paper>{authInfoContent}</Paper>
      <Paper>
        <Button
          onClick={() => {
            registryAppContext.createUserFeed(
              'TestUserFeed' + getRandomInt(100)
            );
          }}
        >
          Test!
        </Button>
        <Button onClick={() => registryAppContext.requestOrbitIdentity()}>
          Request Orbit ID
        </Button>
      </Paper>

      {/*Debug*/}
      <Paper>
        <h4>Registry App Context Data:</h4>
        <pre>{JSON.stringify(registryAppContext, null, 2)}</pre>
      </Paper>
    </AppPage>
  );
};

export default RegistryDashboardPage;
