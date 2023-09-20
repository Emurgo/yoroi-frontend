// @flow
import { createTheme } from '@mui/material/styles';
import { commonRevampTheme } from './common-theme';
import { deepmerge } from '@mui/utils';
import { darkTheme } from './dark-theme-base';
import {
  DarkRevampButton,
  RevampCheckbox,
  RevampTextField,
  RevampOutlinedInput,
  RevampFormHelperText,
  RevampFormControl,
  RevampMenu,
  RevampMenuItem,
  RevampTabs,
  RevampTabPanel,
  RevampChip,
  RevampTooltip,
  RevampInputLabel,
  RevampSelect,
} from '../../overrides/revamp';

const darkThemeComponents = {
  components: {
    MuiButton: DarkRevampButton,
    MuiCheckbox: RevampCheckbox,
    MuiTextField: RevampTextField,
    MuiOutlinedInput: RevampOutlinedInput,
    MuiFormHelperText: RevampFormHelperText,
    MuiFormControl: RevampFormControl,
    MuiSelect: RevampSelect,
    MuiInputLabel: RevampInputLabel,
    MuiMenu: RevampMenu,
    MuiMenuItem: RevampMenuItem,
    MuiTabs: RevampTabs,
    MuiTabPanel: RevampTabPanel,
    MuiChip: RevampChip,
    MuiTooltip: RevampTooltip,
  },
};

const revampDarkTheme = deepmerge(darkTheme, darkThemeComponents);

export const revampBaseTheme: Object = createTheme(deepmerge(commonRevampTheme, revampDarkTheme));
