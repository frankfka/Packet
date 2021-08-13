import { createTheme } from '@material-ui/core';
import green from '@material-ui/core/colors/green';

const theme = createTheme({
  palette: {
    primary: {
      main: '#000',
    },
    secondary: {
      main: green['900'],
    },
  },
  typography: {
    fontFamily: 'Inter, Arial',
    button: {
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 48,
  },
});

export default theme;
