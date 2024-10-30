// @flow
import { createTheme } from '@mui/material/styles';
import { deepmerge } from '@mui/utils';
import {
  Checkbox,
  Chip,
  FormControl,
  FormHelperText,
  InputLabel,
  LightButton,
  Link,
  Menu,
  MenuItem,
  OutlinedInput,
  Select,
  TabPanel,
  Tabs,
  TextField,
  Tooltip
} from '../overrides';
import { commonTheme } from './common-theme';
import { lightThemeBase } from './light-theme-base';

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
    MuiLink: Link,
  },
};

export const baseLightTheme: Object = createTheme(
  deepmerge(commonTheme, deepmerge(lightThemeBase, lightThemeComponents))
);
