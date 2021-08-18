import {
  Avatar,
  createStyles,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemSecondaryAction,
  ListItemText,
  makeStyles,
  Paper,
  Typography,
} from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import React from 'react';
import getFeedAvatarPlaceholderName from '../../../../util/getFeedAvatarPlaceholderName';
import { FeedKvStoreData } from '../../../../util/orbitDb/feed/FeedDataTypes';

type Props = {
  loadedFeeds: Record<string, FeedKvStoreData>;
  inProgressFeedAddresses: string[];
  onDeleteClicked(address: string): void;
};

const useStyles = makeStyles((theme) =>
  createStyles({
    containerRoot: {
      width: '100%',
      padding: theme.spacing(4, 4, 2, 4),
      marginBottom: theme.spacing(4),
    },
    listItemContainer: {
      padding: theme.spacing(2, 0),
    },
    listItemMultilineText: {
      maxWidth: '80%',
    },
  })
);

const IntakeSubscriptionsList: React.FC<Props> = ({
  loadedFeeds,
  inProgressFeedAddresses,
  onDeleteClicked,
}) => {
  const classes = useStyles();

  console.log('Loaded feeds', loadedFeeds);

  return (
    <div>
      {/*In Progress*/}
      {inProgressFeedAddresses.length > 0 && (
        <Paper className={classes.containerRoot}>
          <Typography variant="h6" paragraph>
            Not Yet Loaded
          </Typography>{' '}
          <List>
            {inProgressFeedAddresses.map((address, index) => {
              return (
                <div key={address}>
                  <ListItem className={classes.listItemContainer}>
                    <ListItemText
                      primary={address}
                      secondary="Store Address"
                      classes={{
                        multiline: classes.listItemMultilineText,
                      }}
                    />

                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={() => onDeleteClicked(address)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>

                  {index < Object.keys(inProgressFeedAddresses).length - 1 && (
                    <Divider variant="fullWidth" component="li" />
                  )}
                </div>
              );
            })}
          </List>
        </Paper>
      )}
      {/*Loaded*/}
      {Object.keys(loadedFeeds).length > 0 && (
        <Paper className={classes.containerRoot}>
          <Typography variant="h6" paragraph>
            Active
          </Typography>
          <List>
            {Object.keys(loadedFeeds).map((address, index) => {
              const feed = loadedFeeds[address];

              // First letter of the name, capitalized
              const avatarPlaceholderName = getFeedAvatarPlaceholderName(
                feed.name
              );

              return (
                <div key={address}>
                  <ListItem className={classes.listItemContainer}>
                    <ListItemAvatar>
                      <Avatar
                        alt={`Icon for ${feed.name} feed`}
                        src={feed.iconUri}
                      >
                        {avatarPlaceholderName}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={feed.name}
                      classes={{
                        multiline: classes.listItemMultilineText,
                      }}
                    />

                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={() => onDeleteClicked(address)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>

                  {index < Object.keys(loadedFeeds).length - 1 && (
                    <Divider variant="fullWidth" component="li" />
                  )}
                </div>
              );
            })}
          </List>
        </Paper>
      )}
    </div>
  );
};

export default IntakeSubscriptionsList;
