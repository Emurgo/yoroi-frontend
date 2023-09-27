// @flow
import { createTheme } from '@mui/material/styles';
import { deepmerge } from '@mui/utils';
import { revampBaseTheme as revampBaseThemeLight } from './revamp/light-theme-mui';
import { revampBaseTheme as revampBaseThemeDark } from './revamp/dark-theme-mui';

export function getDesignTokens(mode: string): Object {
  return mode === 'light' ? revampBaseThemeLight : revampBaseThemeDark;
}

// Old way
const theme = { name: 'revamp' };
export const revampTheme: Object = createTheme(deepmerge(theme, revampBaseThemeLight));
