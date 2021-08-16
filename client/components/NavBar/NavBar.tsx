import { AppBar, Toolbar } from '@material-ui/core';
import Image from 'next/Image';
import React from 'react';

import AppLogo from '../../../public/packet_logo.svg';

const NavBar = () => {
  return (
    <>
      <AppBar color="default">
        <Toolbar>
          <Image src={AppLogo} height={36} width={36} alt="Packet Logo" />
        </Toolbar>
      </AppBar>
      <Toolbar />
    </>
  );
};

export default NavBar;
