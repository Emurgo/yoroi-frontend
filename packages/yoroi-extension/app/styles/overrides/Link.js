// @flow

import { darkThemeBase } from '../themes/dark-theme-base';
import { lightThemeBase } from '../themes/light-theme-base';

const { palette: darkThemePalette } = darkThemeBase;
const { palette: lightThemePalette } = lightThemeBase;
const ltDs = lightThemePalette.ds;
const dtDs = darkThemePalette.ds;

export const LightLink = {
  styleOverrides: {
    root: {
      color: ltDs.text_primary_medium,
      textDecoration: 'none',
      '&:hover': {
        textDecoration: 'underline',
        color: ltDs.text_primary_max,
      },
    },
  },
}

export const DarkLink = {
  styleOverrides: {
    root: {
      color: dtDs.text_primary_medium,
      textDecoration: 'none',
      '&:hover': {
        textDecoration: 'underline',
        color: dtDs.text_primary_max,
      },
    },
  },
}
