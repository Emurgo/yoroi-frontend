// @flow
import { createTheme } from '@mui/material/styles';
import { deepmerge } from '@mui/utils';
import {
  Checkbox,
  Chip,
  DarkButton,
  FormControl,
  FormHelperText,
  InputLabel,
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
import { darkThemeBase } from './dark-theme-base';

const darkThemeComponents = {
  components: {
    MuiButton: DarkButton,
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

export const baseDarkTheme: Object = createTheme(
  deepmerge(commonTheme, deepmerge(darkThemeBase, darkThemeComponents))
);
