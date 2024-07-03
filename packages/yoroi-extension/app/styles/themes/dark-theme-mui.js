// @flow
import { createTheme } from '@mui/material/styles';
import { commonTheme } from './common-theme';
import { deepmerge } from '@mui/utils';
import { darkThemeBase } from './dark-theme-base';
import {
  DarkButton,
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
  },
};

export const baseDarkTheme: Object = createTheme(
  deepmerge(commonTheme, deepmerge(darkThemeBase, darkThemeComponents))
);
