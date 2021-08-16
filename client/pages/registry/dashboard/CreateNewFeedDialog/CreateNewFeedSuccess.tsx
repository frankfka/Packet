import { Typography } from '@material-ui/core';
import React from 'react';
import CenteredInfoContainer from '../../../../components/CenteredInfoContainer/CenteredInfoContainer';
import TextFieldWithCopy from '../../../../components/TextFieldWithCopy/TextFieldWithCopy';

type Props = {
  createdFeedAddress: string;
};

const CreateNewFeedSuccess: React.FC<Props> = ({ createdFeedAddress }) => {
  return (
    <CenteredInfoContainer py={5} px={5}>
      <Typography variant="h4" paragraph>
        Congratulations! 🎉
      </Typography>
      <Typography variant="subtitle1" paragraph>
        Your feed was created. Readers can subscribe by using the unique feed
        address below
      </Typography>
      <TextFieldWithCopy
        value={createdFeedAddress}
        readOnly
        variant="outlined"
        fullWidth
      />
    </CenteredInfoContainer>
  );
};

export default CreateNewFeedSuccess;
