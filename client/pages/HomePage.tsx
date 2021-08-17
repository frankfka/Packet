import { Box, Button, Typography } from '@material-ui/core';
import Image from 'next/Image';
import Link from 'next/Link';
import React from 'react';

import AppLogo from '../../public/packet_logo.svg';
import AppPage from '../components/AppPage/AppPage';
import CenteredInfoContainer from '../components/CenteredInfoContainer/CenteredInfoContainer';
import SpacingContainer from '../components/SpacingContainer/SpacingContainer';

const HomePage = () => {
  return (
    <AppPage>
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
      >
        <CenteredInfoContainer>
          <SpacingContainer direction="column">
            <Image src={AppLogo} height={256} width={256} alt="Packet Logo" />
            <Typography variant="h3">Welcome to Packet</Typography>
            <Typography variant="subtitle1" paragraph>
              A content-distribution protocol and ecosystem designed to replace
              email.
            </Typography>

            <Typography variant="body1">View the demo apps below:</Typography>
            <Link href="/registry" passHref>
              <Button variant="outlined" color="secondary" size="large">
                Registry - Publishing Dashboard
              </Button>
            </Link>
            <Link href="/intake" passHref>
              <Button variant="outlined" color="secondary" size="large">
                Intake - Reader App
              </Button>
            </Link>
          </SpacingContainer>
        </CenteredInfoContainer>
      </Box>
    </AppPage>
  );
};

export default HomePage;
