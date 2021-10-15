// @flow
import { createTheme } from '@mui/material/styles';
import { RubikFonts, RobotoMonoFonts } from '../fonts';
import {
  ModernButton,
  ModernCheckbox,
  ModernTextField,
  ModernMenu,
  ModernMenuItem,
  ModernTabs,
  ModernTabPanel,
  ModernChip,
  ModernTooltip,
  ModernInputLabel,
  ModernSelect,
} from '../overrides';

export const modernTheme: Object = createTheme({
  name: 'modern',
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        ${RubikFonts}
        ${RobotoMonoFonts}
      `,
    },
    MuiButton: ModernButton,
    MuiCheckbox: ModernCheckbox,
    MuiTextField: ModernTextField,
    MuiSelect: ModernSelect,
    MuiInputLabel: ModernInputLabel,
    MuiMenu: ModernMenu,
    MuiMenuItem: ModernMenuItem,
    MuiTabs: ModernTabs,
    MuiTabPanel: ModernTabPanel,
    MuiChip: ModernChip,
    MuiTooltip: ModernTooltip,
  },
  palette: {
    primary: {
      main: 'hsl(232, 100%, 64%)',
    },
    secondary: {
      main: 'hsl(167, 80%, 45%)',
      light: 'hsl(168deg 82% 49% / 10%)',
      dark: 'hsl(168 82% 49%)',
      disabled: 'rgb(201 237 229)',
      contrastText: 'hsl(0deg 0% 100%)',
    },
    error: {
      main: 'hsl(345, 100%, 54%)',
    },
    warning: {
      main: 'hsl(38, 92%, 55%)',
    },
    input: {
      main: 'hsl(0 0% 61%)',
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
      '900': 'hsl(228, 22%, 18%)',
    },
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: 'Rubik, sans-serif',
    tooltip: {
      fontWeight: 400,
      fontSize: '0.75rem',
    }
  },
});
