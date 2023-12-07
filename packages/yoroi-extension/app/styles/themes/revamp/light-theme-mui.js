// @flow
import { createTheme } from '@mui/material/styles';
import { commonRevampTheme } from './common-theme';
import { deepmerge } from '@mui/utils';
import { lightTheme } from './light-theme-base';
import {
  LightRevampButton,
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

const lightThemeComponents = {
  components: {
    MuiButton: LightRevampButton,
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

const revampLightTheme = deepmerge(lightTheme, lightThemeComponents);

export const revampBaseTheme: Object = createTheme(deepmerge(commonRevampTheme, revampLightTheme));
