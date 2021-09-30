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
      light: '#164FD6',
      main: '#3154CB',
      dark: '#1A44B7',
    },
    secondary: {
      main: '#17D1AA',
      light: 'hsl(168deg 82% 49% / 10%)',
      dark: '#16e3ba',
      disabled: '#c9ede5',
      contrastText: '#fff',
    },
    error: {
      main: '#FF1351',
    },
    warning: {
      main: '#f6a823',
    },
    input: {
      main: '#9c9c9c',
      dark: '#4a4a4a',
    },
    grey: {
      '50': '#F0F3F5',
      '100': '#EAEDF2',
      '200': '#DCE0E9',
      '300': '#C4CAD7',
      '400': '#A7AFC0',
      '500': '#8A92A3',
      '600': '#6B7384',
      '700': '#4A5065',
      '800': '#383E54',
      '900': '#242838',
    },
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: 'Rubik, sans-serif',
    h1: {
      fontWeight: 500,
      fontSize: '1.875rem',
    },
    h2: {
      fontWeight: 500,
      fontSize: '1.75rem',
    },
    h3: {
      fontWeight: 500,
      fontSize: '1.5rem',
    },
    h4: {
      fontWeight: 500,
      fontSize: '1.25rem',
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.125rem',
    },
    h6: {
      fontWeight: 500,
      fontSize: '1rem',
      textTransform: 'uppercase',
    },
    h7: {
      fontWeight: 500,
      fontSize: '0.875rem',
      textTransform: 'uppercase',
    },
    body1: {
      fontWeight: 400,
      fontSize: '1rem',
    },
    body2: {
      fontWeight: 400,
      fontSize: '0.875rem',
    },
    body3: {
      fontWeight: 400,
      fontSize: '0.75rem',
    },
  },
});
