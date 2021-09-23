// @flow
import { createTheme } from '@mui/material/styles';
import { SFUIDisplayFonts, RobotoMonoFonts } from '../fonts';
import {
  ClassicButton,
  ClassicCheckbox,
  ClassicInputLabel,
  ClassicTextField,
  ClassicMenu,
  ClassicMenuItem,
  ClassicTabs,
  ClassicTabPanel,
  ClassicChip,
  ClassicTooltip,
  ClassicSelect,
} from '../overrides';

export const classicTheme: Object = createTheme({
  name: 'classic',
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        ${SFUIDisplayFonts}
        ${RobotoMonoFonts}
      `,
    },
    MuiButton: ClassicButton,
    MuiCheckbox: ClassicCheckbox,
    MuiInputLabel: ClassicInputLabel,
    MuiTextField: ClassicTextField,
    MuiSelect: ClassicSelect,
    MuiMenuItem: ClassicMenuItem,
    MuiMenu: ClassicMenu,
    MuiTabs: ClassicTabs,
    MuiTabPanel: ClassicTabPanel,
    MuiChip: ClassicChip,
    MuiTooltip: ClassicTooltip,
  },
  palette: {
    primary: {
      main: 'hsl(223, 20%, 27%)',
    },
    secondary: {
      main: 'hsl(9, 46%, 73%)',
      light: 'hsl(9 46% 73% / 20%)',
      dark: 'hsl(10 66% 79%)',
      disabled: 'hsl(9 46% 73% / 30%)',
      contrastText: 'hsl(210 25% 98%)',
    },
    error: {
      main: 'hsl(354, 79%, 61%)',
    },
    warning: {
      main: 'hsl(4, 79%, 58%)',
    },
    input: {
      main: 'hsl(214 16% 81%)',
      dark: 'hsl(0 0% 29%)',
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
  shape: {
    borderRadius: 0,
  },
  typography: {
    fontFamily: '"SFUIDisplay", sans-serif',
    tooltip: {
      fontWeight: 400,
      fontSize: '0.75rem',
    },
  },
});
