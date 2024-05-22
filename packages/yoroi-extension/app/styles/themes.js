// @flow

import { createTheme } from '@mui/material/styles';
import { deepmerge } from '@mui/utils';
import { revampBaseTheme as revampBaseThemeLight } from './themes/revamp/light-theme-mui';
import { classicTheme } from './themes/classic-theme';
import { modernTheme } from './themes/modern-theme';

export const THEMES = Object.freeze({
  YOROI_CLASSIC: 'YoroiClassic',
  YOROI_MODERN: 'YoroiModern',
  YOROI_REVAMP: 'YoroiRevamp',
});
export type Theme = $Values<typeof THEMES>;
// Old way
export const revampTheme: Object =
  createTheme(deepmerge({ name: 'revamp' }, revampBaseThemeLight));
export const MuiThemes: {| [Theme]: Object |} = Object.freeze({
  [THEMES.YOROI_CLASSIC]: classicTheme,
  [THEMES.YOROI_MODERN]: modernTheme,
  [THEMES.YOROI_REVAMP]: revampTheme,
});

// Refer: https://github.com/Emurgo/yoroi-frontend/pull/497
export function changeToplevelTheme(currentTheme: Theme) {
  if (document && document.body instanceof HTMLBodyElement) {
    // Flow give error when directly assesing document.body.classList.[remove()]|[add()]
    const bodyClassList = document.body.classList;
    // we can't simply set the className because there can be other classes present
    // therefore we only remove & add those related to the theme
    const allThemes: Array<string> = Object.keys(THEMES).map(key => THEMES[key]);
    bodyClassList.remove(...allThemes);
    bodyClassList.remove('YoroiShelley');
    bodyClassList.add(currentTheme);
  }
}