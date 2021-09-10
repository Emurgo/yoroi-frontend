// @flow
import { createTheme } from '@mui/material/styles';
import { SFUIDisplayFonts } from '../fonts';
import {
  ClassicButton,
  ClassicCheckbox,
  ClassicTextField,
  ClassicMenu,
  ClassicMenuItem,
  ClassicTabs,
  ClassicTabPanel,
  ClassicChip,
} from '../overrides';

export const classicTheme: Object = createTheme({
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        ${SFUIDisplayFonts}
      `,
    },
    MuiButton: ClassicButton,
    MuiCheckbox: ClassicCheckbox,
    MuiTextField: ClassicTextField,
    MuiMenuItem: ClassicMenuItem,
    MuiMenu: ClassicMenu,
    MuiTabs: ClassicTabs,
    MuiTabPanel: ClassicTabPanel,
    MuiChip: ClassicChip,
  },
  palette: {
    primary: {
      main: 'hsl(223, 20%, 27%)',
    },
    secondary: {
      main: 'hsl(9, 46%, 73%)',
      light: 'hsl(9 46% 73% / 20%)',
      dark: 'hsl(10 66% 79%)',
      contrastText: 'hsl(210 25% 98%)',
    },
    error: {
      main: 'hsl(354, 79%, 61%)',
    },
    warning: {
      main: 'hsl(4, 79%, 58%)',
    },
    grey: {
      '50': 'hsl(201, 22%, 95%)',
      '100': 'hsl(216, 26%, 93%)',
      '200': 'hsl(219, 23%, 89%)',
      '300': 'hsl(222, 19%, 81%)',
      '400': 'hsl(221, 17%, 70%)',
      '500': 'hsl(221, 12%, 59%)',
      '600': 'hsl(221, 10%, 47%)',
      '700': 'hsl(228, 15%, 34%)',
      '800': 'hsl(229, 20%, 28%)',
      '900': 'hsl(236, 37%, 11%)',
    },
  },
  typography: {
    fontFamily: '"SFUIDisplay", sans-serif',
  },
});
