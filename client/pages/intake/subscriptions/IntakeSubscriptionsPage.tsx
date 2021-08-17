import { Button, Grid, Paper, Typography } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import React, { useState } from 'react';
import AppPage from '../../../components/AppPage/AppPage';
import BackButton from '../../../components/BackButton/BackButton';
import CenteredInfoContainer from '../../../components/CenteredInfoContainer/CenteredInfoContainer';
import LoadingView from '../../../components/LoadingView/LoadingView';
import SpacingContainer from '../../../components/SpacingContainer/SpacingContainer';
import { useIntakeApp } from '../../../context/intakeApp/intakeAppContext';
import { FeedKvStoreData } from '../../../util/orbitDb/feed/FeedDataTypes';
import IntakeAddSubscriptionDialog from './IntakeAddSubscriptionDialog/IntakeAddSubscriptionDialog';
import IntakeSubscriptionsList from './IntakeLoadedSubscriptionsList/IntakeSubscriptionsList';

const IntakeSubscriptionsPage = () => {
  const intakeApp = useIntakeApp();

  const [showAddSubscriptionDialog, setShowAddSubscriptionDialog] =
    useState(false);

  const enableInteraction = !intakeApp.isLoadingUser;
  const isLoading = intakeApp.isLoadingUser || intakeApp.isLoadingSubscriptions;

  const inProgressAddresses: string[] = []; // Not yet loaded
  const loadedSubscriptionFeeds: Record<string, FeedKvStoreData> = {};

  // Extract loaded feeds and not yet loaded feeds
  Object.keys(intakeApp.subscriptionStores ?? {}).forEach(
    (rootStoreAddress) => {
      const subscriptionData = intakeApp.subscriptions[rootStoreAddress];

      // Initialized if the data exists for the store address
      if (
        subscriptionData != null &&
        !!subscriptionData.feedInfo.postsDbAddress
      ) {
        // Initialized
        loadedSubscriptionFeeds[rootStoreAddress] = subscriptionData.feedInfo;
      } else {
        // Not yet initialized
        inProgressAddresses.push(rootStoreAddress);
      }
    }
  );

  const onAddSubscription = (address: string) => {
    setShowAddSubscriptionDialog(false);

    if (enableInteraction && !isLoading) {
      intakeApp.addSubscription(address);
    }
  };

  const onDeleteSubscription = (address: string) => {
    if (enableInteraction && !isLoading) {
      intakeApp.removeSubscription(address);
    }
  };

  const loadingView = isLoading && <LoadingView py={20} />;
  const noSubscriptionsView = !isLoading &&
    inProgressAddresses.length === 0 &&
    Object.keys(loadedSubscriptionFeeds).length === 0 && (
      <Paper>
        <CenteredInfoContainer>
          <Typography variant="h4" paragraph>
            No Subscriptions
          </Typography>
          <Button
            variant="contained"
            size="large"
            color="secondary"
            onClick={() => setShowAddSubscriptionDialog(true)}
          >
            Add Subscription
          </Button>
        </CenteredInfoContainer>
      </Paper>
    );

  return (
    <AppPage>
      {/*Add dialog*/}
      <IntakeAddSubscriptionDialog
        isOpen={showAddSubscriptionDialog}
        setIsOpen={setShowAddSubscriptionDialog}
        onAddClicked={onAddSubscription}
      />

      {/*Main content*/}
      <SpacingContainer direction="column">
        <BackButton />
        {/*Title*/}
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid item>
            <Typography variant="h3">Subscriptions</Typography>
          </Grid>
          <Grid item>
            <Button
              disabled={!enableInteraction}
              color="secondary"
              startIcon={<AddIcon />}
              variant="outlined"
              size="large"
              onClick={() => setShowAddSubscriptionDialog(true)}
            >
              Add
            </Button>
          </Grid>
        </Grid>

        {/*Subscriptions main content*/}

        {/*Loading*/}
        {loadingView}

        {/*No Subscriptions view*/}
        {noSubscriptionsView}

        {/*Main content*/}
        <IntakeSubscriptionsList
          inProgressFeedAddresses={inProgressAddresses}
          loadedFeeds={loadedSubscriptionFeeds}
          onDeleteClicked={onDeleteSubscription}
        />
      </SpacingContainer>
    </AppPage>
  );
};

export default IntakeSubscriptionsPage;
