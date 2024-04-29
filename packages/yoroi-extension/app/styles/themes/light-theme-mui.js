// @flow
import { createTheme } from '@mui/material/styles';
import { commonTheme } from './common-theme';
import { deepmerge } from '@mui/utils';
import { lightThemeBase } from './light-theme-base';
import {
  LightButton,
  Checkbox,
  TextField,
  OutlinedInput,
  FormHelperText,
  FormControl,
  Menu,
  MenuItem,
  Tabs,
  TabPanel,
  Chip,
  Tooltip,
  InputLabel,
  Select,
} from '../overrides';

const lightThemeComponents = {
  components: {
    MuiButton: LightButton,
    MuiCheckbox: Checkbox,
    MuiTextField: TextField,
    MuiOutlinedInput: OutlinedInput,
    MuiFormHelperText: FormHelperText,
    MuiFormControl: FormControl,
    MuiSelect: Select,
    MuiInputLabel: InputLabel,
    MuiMenu: Menu,
    MuiMenuItem: MenuItem,
    MuiTabs: Tabs,
    MuiTabPanel: TabPanel,
    MuiChip: Chip,
    MuiTooltip: Tooltip,
  },
};

export const baseLightTheme: Object = createTheme(
  deepmerge(commonTheme, deepmerge(lightThemeBase, lightThemeComponents))
);
