import {
  createStyles,
  Divider,
  List,
  ListItem,
  ListItemText,
  makeStyles,
} from '@material-ui/core';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import Link from 'next/Link';
import React from 'react';
import { dateFromIsoString, formatDate } from '../../../../util/dateUtils';
import { JsonFeedPostData } from '../../../../util/orbitDb/feed/FeedPostData';

type Props = {
  rootFeedStoreAddress: string;
  posts: Record<string, JsonFeedPostData>;
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

const RegistryFeedPostsList: React.FC<Props> = ({
  posts,
  rootFeedStoreAddress,
}) => {
  const classes = useStyles();

  const postHashes = Object.keys(posts);

  return (
    <div>
      <List className={classes.root}>
        {postHashes.map((hash, index) => {
          const post = posts[hash];
          const createdAt = formatDate(dateFromIsoString(post.createdAt));

          return (
            <div key={hash}>
              <Link
                href={`/registry/feed/${encodeURIComponent(
                  rootFeedStoreAddress
                )}/${encodeURIComponent(hash)}`}
              >
                <ListItem className={classes.listItemContainer}>
                  <ListItemText primary={post.title} secondary={createdAt} />
                  <ChevronRightIcon />
                </ListItem>
              </Link>

              {index < postHashes.length - 1 && (
                <Divider variant="middle" component="li" />
              )}
            </div>
          );
        })}
      </List>
    </div>
  );
};

export default RegistryFeedPostsList;
