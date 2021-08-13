import { Box, makeStyles } from '@material-ui/core';
import React from 'react';

type Props = {};

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: '100vh',
  },
  content: {
    width: '100%',
    height: '100%',
    padding: theme.spacing(10),
  },
}));

const AppPage: React.FC<Props> = ({ children }) => {
  const classes = useStyles();

  return (
    <Box className={classes.root}>
      <Box className={classes.content}>{children}</Box>
    </Box>
  );
};

export default AppPage;
