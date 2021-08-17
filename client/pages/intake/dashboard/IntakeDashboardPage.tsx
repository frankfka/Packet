import { Button, Grid, Paper, Typography } from '@material-ui/core';
import SettingsIcon from '@material-ui/icons/Settings';
import React from 'react';
import AppPage from '../../../components/AppPage/AppPage';
import LoadingView from '../../../components/LoadingView/LoadingView';
import SpacingContainer from '../../../components/SpacingContainer/SpacingContainer';
import { useIntakeApp } from '../../../context/intakeApp/intakeAppContext';
import IntakeLatestPostsList from './IntakeLatestPostsList/IntakeLatestPostsList';

const IntakeDashboardPage = () => {
  const intakeApp = useIntakeApp();

  const isLoading = intakeApp.isLoadingUser || intakeApp.isLoadingSubscriptions;
  const enableInteraction = !intakeApp.isLoadingUser;

  const loadingView = isLoading && <LoadingView py={20} />;
  const latestContentView = !isLoading && (
    <IntakeLatestPostsList loadedFeeds={intakeApp.subscriptions} />
  );

  return (
    <AppPage>
      <SpacingContainer direction="column">
        {/*Title*/}
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid item>
            <Typography variant="h3">Latest</Typography>
          </Grid>
          <Grid item>
            <Button
              disabled={!enableInteraction}
              color="secondary"
              startIcon={<SettingsIcon />}
              variant="outlined"
              size="large"
            >
              Subscriptions
            </Button>
          </Grid>
        </Grid>

        {/*Subscriptions main content*/}
        <Paper>
          {/*Loading*/}
          {loadingView}
          {/*Latest Feed*/}
          {latestContentView}
        </Paper>
      </SpacingContainer>
    </AppPage>
  );
};

export default IntakeDashboardPage;
