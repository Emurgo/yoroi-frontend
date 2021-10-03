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
  ClassicMenu,
  ClassicMenuItem,
  ClassicTabs,
  ClassicTabPanel,
  ClassicChip,
  ClassicTooltip,
  ClassicSelect,
} from '../overrides';
import { commonTheme } from './common-theme';

export const classicTheme: Object = createTheme(
  {
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
    },
    shape: {
      borderRadius: 0,
    },
    typography: {
      fontFamily: '"SFUIDisplay", sans-serif',
    },
  },
  commonTheme
);
