// @flow
import { createTheme } from '@mui/material/styles';
import { RubikFonts, RobotoMonoFonts } from '../fonts';
import {
  ModernButton,
  ModernCheckbox,
  ModernTextField,
  ModernOutlinedInput,
  ModernFormHelperText,
  ModernMenu,
  ModernMenuItem,
  ModernTabs,
  ModernTabPanel,
  ModernChip,
  ModernTooltip,
  ModernInputLabel,
  ModernSelect,
} from '../overrides';
import { commonTheme } from './common-theme';

export const modernTheme: Object = createTheme(
  {
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
      MuiOutlinedInput: ModernOutlinedInput,
      MuiFormHelperText: ModernFormHelperText,
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
      /* `main` is added since MUI required it but we don't use it at all */
      primary: {
        main: '#3154CB',
        '50': '#F0F2FB',
        '100': '#164FD6',
        '200': '#3154CB',
        '300': '#1A44B7',
        contrastText: '#FFF',
      },
      secondary: {
        main: '#16E3BA',
        '50': '#F4FDFA', // ?
        '100': '#C9ECE5', // light
        '200': '#16E3BA', // main - hover btn color -
        '300': '#17D1AA', // dark
        contrastText: '#FFF',
      },
    },
    shape: {
      borderRadius: 8,
    },
    typography: {
      fontFamily: 'Rubik, sans-serif',
    },
  },
  commonTheme
);
