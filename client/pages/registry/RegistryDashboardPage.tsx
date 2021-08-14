import { Button, Grid, Paper, Typography } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import React, { useState } from 'react';
import AppPage from '../../components/AppPage/AppPage';
import { useEthereumContext } from '../../context/ethereum/ethereumContext';
import { useRegistryApp } from '../../context/registryApp/registryAppContext';
import CreateNewFeedDialog from './CreateNewFeedDialog/CreateNewFeedDialog';
import {
  NoConnectedAccountContent,
  NoUserFeedsContent,
  NoWeb3ProviderContent,
} from './RegistryInfoContent';

function getRandomInt(max: number): string {
  return Math.floor(Math.random() * max).toFixed(0);
}

const RegistryDashboardPage = () => {
  // Context
  const registryAppContext = useRegistryApp();
  const { providerAvailable } = useEthereumContext();

  // Create feed state
  const [showCreateFeedDialog, setShowCreateFeedDialog] = useState(false);

  // Render the appropriate content depending on the authentication state
  let authInfoContent: React.ReactElement | undefined = undefined;
  if (!providerAvailable) {
    authInfoContent = <NoWeb3ProviderContent />;
  } else if (registryAppContext.isReady && !registryAppContext.userId) {
    authInfoContent = (
      <NoConnectedAccountContent
        onConnectAccountClicked={() => registryAppContext.login()}
      />
    );
  }

  const enableFeedInteraction =
    !!registryAppContext.userId && !registryAppContext.isLoadingUserFeeds;

  const onCreateFeedClicked = () => {
    if (!enableFeedInteraction) return;

    setShowCreateFeedDialog(true);
  };

  // Render the appropriate content for publications
  let publicationsContent: React.ReactElement | undefined = undefined;
  if (enableFeedInteraction) {
    const userHasFeeds =
      Object.keys(registryAppContext.loadedUserFeeds).length > 0;
    // Can render publications
    if (userHasFeeds) {
      // TODO
    } else {
      publicationsContent = (
        <NoUserFeedsContent onCreateFeedClicked={onCreateFeedClicked} />
      );
    }
  }

  return (
    <AppPage>
      {/*Create dialog*/}
      <CreateNewFeedDialog
        isOpen={showCreateFeedDialog}
        setIsOpen={setShowCreateFeedDialog}
      />

      {/*Publications*/}
      <Grid container alignItems="center" justifyContent="space-between">
        <Grid item>
          <Typography variant="h3">Manage Feeds</Typography>
        </Grid>
        <Grid item>
          <Button
            disabled={!enableFeedInteraction}
            onClick={onCreateFeedClicked}
            color="secondary"
            startIcon={<AddIcon />}
            variant="outlined"
            size="large"
          >
            New
          </Button>
        </Grid>
      </Grid>

      <Paper>
        {/*Request for auth*/}
        {authInfoContent}
        {/*Publications*/}
        {publicationsContent}
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
