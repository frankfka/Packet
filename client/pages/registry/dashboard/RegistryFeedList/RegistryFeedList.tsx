import {
  Avatar,
  createStyles,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  makeStyles,
} from '@material-ui/core';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import Link from 'next/link';
import React from 'react';
import getFeedAvatarPlaceholderName from '../../../../util/getFeedAvatarPlaceholderName';
import { FeedKvStoreData } from '../../../../util/orbitDb/feed/FeedDataTypes';

type Props = {
  feeds: Record<string, FeedKvStoreData>;
};

const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      width: '100%',
      padding: theme.spacing(2),
    },
    listItemContainer: {
      cursor: 'pointer',
      padding: theme.spacing(2, 4),
    },
  })
);

const RegistryFeedList: React.FC<Props> = ({ feeds }) => {
  const classes = useStyles();

  const feedAddresses = Object.keys(feeds);

  return (
    <div>
      <List className={classes.root}>
        {feedAddresses.map((address, index) => {
          const feed = feeds[address];

          // First letter of the name, capitalized
          const avatarPlaceholderName = getFeedAvatarPlaceholderName(feed.name);

          return (
            <div key={address}>
              <Link href={`/registry/feed/${encodeURIComponent(address)}`}>
                <ListItem className={classes.listItemContainer}>
                  <ListItemAvatar>
                    <Avatar
                      alt={`Icon for ${feed.name} feed`}
                      src={feed.iconUri}
                    >
                      {avatarPlaceholderName}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText primary={feed.name} />
                  <ChevronRightIcon />
                </ListItem>
              </Link>

              {index < feedAddresses.length - 1 && (
                <Divider variant="middle" component="li" />
              )}
            </div>
          );
        })}
      </List>
    </div>
  );
};

export default RegistryFeedList;
