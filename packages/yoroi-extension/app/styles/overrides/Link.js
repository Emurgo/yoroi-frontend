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
        color: ltDs.text_primary_max,
        textDecoration: 'underline',
      },
      ':active': {
        color: ltDs.primary_700,
        textDecoration: 'underline',
      },
      ':focus': {
        color: ltDs.text_primary_medium,
        outlineWidth: '2px',
        outlineStyle: 'solid',
        outlineColor: ltDs.sys_yellow_500,
        textDecoration: 'underline',
      },
      ':disabled': {
        color: ltDs.text_primary_min,
      },
      ':visited': {
        color: ltDs.primary_700,
      }
    },
  },
}

export const DarkLink = {
  styleOverrides: {
    root: {
      color: dtDs.text_primary_medium,
      textDecoration: 'none',
      '&:hover': {
        color: dtDs.text_primary_max,
        textDecoration: 'underline',
      },
      ':active': {
        color: dtDs.primary_700,
        textDecoration: 'underline',
      },
      ':focus': {
        color: dtDs.text_primary_medium,
        outlineWidth: '2px',
        outlineStyle: 'solid',
        outlineColor: dtDs.sys_yellow_500,
        textDecoration: 'underline',
      },
      ':disabled': {
        color: dtDs.text_primary_min,
      },
      ':visited': {
        color: dtDs.primary_700,
      }
    },
  },
}
