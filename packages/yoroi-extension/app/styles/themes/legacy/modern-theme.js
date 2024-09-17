// @flow
import { createTheme } from '@mui/material/styles';
import { RubikFonts, RobotoMonoFonts } from '../../fonts';
import {
  ModernButton,
  ModernCheckbox,
  ModernTextField,
  ModernOutlinedInput,
  ModernFormHelperText,
  ModernFormControl,
  ModernMenu,
  ModernMenuItem,
  ModernTabs,
  ModernTabPanel,
  ModernChip,
  ModernTooltip,
  ModernInputLabel,
  ModernSelect,
} from '../../overrides/legacy';
import { commonTheme } from './common-theme';
import { deepmerge } from '@mui/utils';

const fontFamily = ['Rubik', 'sans-serif'].join(',');

const theme = {
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
    MuiFormControl: ModernFormControl,
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
    background: {
      sidebar: {
        start: '#1e46bd',
        end: '#4760ff',
        text: '#FFFFFF',
      },
      banner: {
        warning: '#f5a623',
      },
      walletAdd: {
        title: '#ffffff',
        subtitle: '#ffffff',
      },
    },
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily,
    h1: {
      fontWeight: 500,
      fontSize: '1.875rem',
      fontFamily,
    },
    h2: {
      fontWeight: 500,
      fontSize: '1.75rem',
      fontFamily,
    },
    h3: {
      fontWeight: 500,
      fontSize: '1.5rem',
      fontFamily,
    },
    h4: {
      fontWeight: 500,
      fontSize: '1.25rem',
      fontFamily,
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.125rem',
      fontFamily,
    },
    h6: {
      fontWeight: 500,
      fontSize: '1rem',
      fontFamily,
      textTransform: 'uppercase',
    },
    h7: {
      fontWeight: 500,
      fontSize: '0.875rem',
      fontFamily,
      textTransform: 'uppercase',
    },
    body1: {
      fontWeight: 400,
      fontSize: '1rem',
      fontFamily,
    },
    body2: {
      fontWeight: 400,
      fontSize: '0.875rem',
      fontFamily,
    },
    body3: {
      fontWeight: 400,
      fontSize: '0.75rem',
      fontFamily,
    },
  },
};
export const modernTheme: Object = createTheme(deepmerge(commonTheme, theme));
