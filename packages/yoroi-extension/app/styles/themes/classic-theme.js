// @flow
import { createTheme } from '@mui/material/styles';
import { SFUIDisplayFonts, RobotoMonoFonts } from '../fonts';
import {
  ClassicButton,
  ClassicCheckbox,
  ClassicInputLabel,
  ClassicTextField,
  ClassicOutlinedInput,
  ClassicFormHelperText,
  ClassicFormControl,
  ClassicMenu,
  ClassicMenuItem,
  ClassicTabs,
  ClassicTabPanel,
  ClassicChip,
  ClassicTooltip,
  ClassicSelect,
} from '../overrides';
import { commonTheme } from './common-theme';
import { deepmerge } from '@mui/utils';

const fontFamily = ['SFUIDisplay', 'sans-serif'].join(',');

const theme = {
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
    MuiOutlinedInput: ClassicOutlinedInput,
    MuiFormHelperText: ClassicFormHelperText,
    MuiFormControl: ClassicFormControl,
    MuiSelect: ClassicSelect,
    MuiMenuItem: ClassicMenuItem,
    MuiMenu: ClassicMenu,
    MuiTabs: ClassicTabs,
    MuiTabPanel: ClassicTabPanel,
    MuiChip: ClassicChip,
    MuiTooltip: ClassicTooltip,
  },
  palette: {
    /* `main` is added since MUI required it but we don't use it at all */
    primary: {
      main: '#3154CB',
      '50': '#E1E7F2',
      '100': '#164FD6',
      '200': '#3154CB',
      '300': '#1A44B7',
      contrastText: '#FFF',
    },
    secondary: {
      main: '#daa49a',
      '50': '#F4FDFA',
      '100': '#C9ECE5',
      '200': '#EDB2A6',
      '300': '#DAA49A',
      contrastText: '#FFF',
    },
    background: {
      sidebarGradient: {
        start: '#373f52',
        end: '#373f52',
      },
    },
  },
  shape: {
    borderRadius: 0,
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
export const classicTheme: Object = createTheme(deepmerge(commonTheme, theme));
