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
import Link from 'next/Link';
import React from 'react';
import { SubscribedFeedData } from '../../../../context/intakeApp/IntakeAppTypes';
import { getAllFeedPosts } from '../../../../context/intakeApp/intakeAppUtils';
import { dateFromIsoString, formatDate } from '../../../../util/dateUtils';
import getFeedAvatarPlaceholderName from '../../../../util/getFeedAvatarPlaceholderName';

type Props = {
  loadedFeeds: Record<string, SubscribedFeedData>;
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

const IntakeLatestPostsList: React.FC<Props> = ({ loadedFeeds }) => {
  const classes = useStyles();

  const posts = getAllFeedPosts(loadedFeeds);

  return (
    <div>
      <List className={classes.root}>
        {posts.map((feedPost, index) => {
          const post = feedPost.post;
          const feedInfo = feedPost.feedInfo;

          // First letter of the name, capitalized
          const avatarPlaceholderName = getFeedAvatarPlaceholderName(
            feedInfo.name
          );

          // Available to viewer page under `useRouter().query`
          const linkParams = new URLSearchParams({
            feedRootAddress: feedPost.feedInfo.rootAddress,
            postHash: feedPost.post.hash,
          });

          return (
            <div key={post.hash}>
              <Link href={`/intake/viewer?${linkParams.toString()}`}>
                <ListItem className={classes.listItemContainer}>
                  <ListItemAvatar>
                    <Avatar
                      alt={`Icon for ${feedInfo.name} feed`}
                      src={feedInfo.iconUri}
                    >
                      {avatarPlaceholderName}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={post.title}
                    secondary={`${formatDate(
                      dateFromIsoString(post.createdAt)
                    )} | ${feedInfo.name}`}
                  />
                  <ChevronRightIcon />
                </ListItem>
              </Link>

              {index < posts.length - 1 && (
                <Divider variant="middle" component="li" />
              )}
            </div>
          );
        })}
      </List>
    </div>
  );
};

export default IntakeLatestPostsList;
