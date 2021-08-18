import { Button, Grid, Paper, Typography } from '@material-ui/core';
import SettingsIcon from '@material-ui/icons/Settings';
import Link from 'next/link';
import React from 'react';
import AppPage from '../../../components/AppPage/AppPage';
import CenteredInfoContainer from '../../../components/CenteredInfoContainer/CenteredInfoContainer';
import LoadingView from '../../../components/LoadingView/LoadingView';
import SpacingContainer from '../../../components/SpacingContainer/SpacingContainer';
import { useIntakeApp } from '../../../context/intakeApp/intakeAppContext';
import { getAllFeedPosts } from '../../../context/intakeApp/intakeAppUtils';
import IntakeLatestPostsList from './IntakeLatestPostsList/IntakeLatestPostsList';

const NoContentView: React.FC = () => {
  return (
    <CenteredInfoContainer>
      <Typography variant="h4" paragraph>
        No Posts
      </Typography>
      <Typography variant="subtitle1" paragraph>
        Get started by subscribing to feeds.
      </Typography>
      <Link href="/intake/subscriptions" passHref>
        <Button variant="contained" size="large" color="secondary">
          Manage Subscriptions
        </Button>
      </Link>
    </CenteredInfoContainer>
  );
};

const IntakeDashboardPage = () => {
  const intakeApp = useIntakeApp();

  const isLoading = intakeApp.isLoadingUser || intakeApp.isLoadingSubscriptions;
  const enableInteraction = !intakeApp.isLoadingUser;

  const loadingView = isLoading && <LoadingView py={20} />;

  const feedPosts = getAllFeedPosts(intakeApp.subscriptions);

  const noContentView = !isLoading && feedPosts.length === 0 && (
    <NoContentView />
  );
  const latestContentView = !isLoading && feedPosts.length > 0 && (
    <IntakeLatestPostsList feedPosts={feedPosts} />
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
            <Link href="/intake/subscriptions" passHref>
              <Button
                disabled={!enableInteraction}
                color="secondary"
                startIcon={<SettingsIcon />}
                variant="outlined"
                size="large"
              >
                Subscriptions
              </Button>
            </Link>
          </Grid>
        </Grid>

        {/*Subscriptions main content*/}
        <Paper>
          {/*Loading*/}
          {loadingView}
          {/*No content view*/}
          {noContentView}
          {/*Latest Feed*/}
          {latestContentView}
        </Paper>
      </SpacingContainer>
    </AppPage>
  );
};

export default IntakeDashboardPage;
