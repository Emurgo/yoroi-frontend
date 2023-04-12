// @flow
import { createTheme } from '@mui/material/styles';
import { RubikFonts, RobotoMonoFonts } from '../fonts';
import {
  ModernCheckbox,
  ModernTextField,
  ModernOutlinedInput,
  ModernFormHelperText,
  ModernFormControl,
  ModernMenu,
  ModernMenuItem,
  RevampTabs,
  ModernTabPanel,
  ModernChip,
  ModernTooltip,
  ModernInputLabel,
  ModernSelect,
  RevampButton,
} from '../overrides';
import { deepmerge } from '@mui/utils';
import { revampBaseTheme } from './revamp-base-theme';

const theme = {
  name: 'revamp',
  components: {
    MuiCssBaseline: {
      styleOverrides: `
      ${RubikFonts}
      ${RobotoMonoFonts}
    `,
    },
    MuiButton: RevampButton,
    MuiCheckbox: ModernCheckbox,
    MuiTextField: ModernTextField,
    MuiOutlinedInput: ModernOutlinedInput,
    MuiFormHelperText: ModernFormHelperText,
    MuiFormControl: ModernFormControl,
    MuiSelect: ModernSelect,
    MuiInputLabel: ModernInputLabel,
    MuiMenu: ModernMenu,
    MuiMenuItem: ModernMenuItem,
    MuiTabs: RevampTabs,
    MuiTabPanel: ModernTabPanel,
    MuiChip: ModernChip,
    MuiTooltip: ModernTooltip,
  },
};
export const revampTheme: Object = createTheme(deepmerge(revampBaseTheme, theme));
