import {
  Avatar,
  Box,
  createStyles,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  makeStyles,
} from '@material-ui/core';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import Link from 'next/link';
import React, { MouseEventHandler } from 'react';
import FeedKvStoreData from '../../../util/orbitDb/feed/FeedKvStoreData';

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
          const onInfoClicked: MouseEventHandler<HTMLButtonElement> = (e) => {
            e.stopPropagation();
            console.log('Hello');
          };

          // First letter of the name, capitalized
          const avatarPlaceholderName = feed.name
            .replace(/s+/, '')
            .substr(0, 1)
            .toUpperCase();

          return (
            <div key={address}>
              <Link href={`/registry/feed/${encodeURIComponent(feed.name)}`}>
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
                  <Box alignItems="center" display="flex">
                    <IconButton onClick={onInfoClicked}>
                      <InfoOutlinedIcon />
                    </IconButton>
                    <ChevronRightIcon />
                  </Box>
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
