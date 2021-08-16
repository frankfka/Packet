import { Typography } from '@material-ui/core';
import React from 'react';
import CenteredInfoContainer from '../../../../components/CenteredInfoContainer/CenteredInfoContainer';

type Props = {};

const CreateNewPostSuccess: React.FC<Props> = () => {
  return (
    <CenteredInfoContainer py={5} px={5}>
      <Typography variant="h4" paragraph>
        Congratulations! 🎉
      </Typography>
      <Typography variant="subtitle1" paragraph>
        Your post was created successfully. Subscribers now have access to view
        the post.
      </Typography>
    </CenteredInfoContainer>
  );
};

export default CreateNewPostSuccess;
