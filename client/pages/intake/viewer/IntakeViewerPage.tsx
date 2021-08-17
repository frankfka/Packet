import { createStyles, makeStyles, Paper, Typography } from '@material-ui/core';
import React from 'react';
import Editor from 'rich-markdown-editor';
import AppPage from '../../../components/AppPage/AppPage';
import BackButton from '../../../components/BackButton/BackButton';
import ErrorView from '../../../components/ErrorView/ErrorView';
import LoadingView from '../../../components/LoadingView/LoadingView';
import SpacingContainer from '../../../components/SpacingContainer/SpacingContainer';
import { useIntakeApp } from '../../../context/intakeApp/intakeAppContext';
import { dateFromIsoString, formatDate } from '../../../util/dateUtils';

type Props = {
  feedRootAddress: string;
  postHash: string;
};

const useStyles = makeStyles((theme) =>
  createStyles({
    postContentContainer: {
      padding: theme.spacing(4),
    },
  })
);

const IntakeViewerPage: React.FC<Props> = ({ feedRootAddress, postHash }) => {
  const classes = useStyles();
  const intakeApp = useIntakeApp();

  const isLoading = intakeApp.isLoadingUser || intakeApp.isLoadingSubscriptions;
  const postData = intakeApp.subscriptions[feedRootAddress]?.posts?.[postHash];

  const loadingView = isLoading && <LoadingView py={35} />;
  const errorView = isLoading && postData == null && <ErrorView py={35} />;

  const postContent = postData != null && (
    <SpacingContainer direction="column">
      <Typography variant="h3">{postData.title}</Typography>
      <Typography variant="caption">
        {`${formatDate(dateFromIsoString(postData.createdAt))} | ${
          intakeApp.subscriptions[feedRootAddress].feedInfo.name
        }`}
      </Typography>
      <Paper className={classes.postContentContainer}>
        <Editor readOnly defaultValue={postData.content} />
      </Paper>
    </SpacingContainer>
  );

  return (
    <AppPage>
      <SpacingContainer direction="column" spacing={4}>
        <BackButton />
        {loadingView}
        {errorView}
        {postContent}
      </SpacingContainer>
    </AppPage>
  );
};

export default IntakeViewerPage;
