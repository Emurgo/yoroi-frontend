// @flow

import { lightThemeBase } from '../themes/light-theme-base';
import { darkThemeBase } from '../themes/dark-theme-base';

const { palette: darkThemePalette } = darkThemeBase;
const { palette: lightThemePalette } = lightThemeBase;
const ltDs = lightThemePalette.ds;
const dtDs = darkThemePalette.ds;

const ButtonCommonProps: Object = {
  styleOverrides: {
    root: {
      fontSize: '1rem',
      borderRadius: 8,
      fontWeight: 500,
      fontFamily: 'Rubik',
      lineHeight: '19px',
      textTransform: 'uppercase',
      padding: '16px',
      boxShadow: 'none',
      '&.MuiButton-sizeLarge': { height: '56px' },
      '&.MuiButton-sizeMedium': { padding: '13px 24px' },
      '&.MuiButton-sizeSmall': { padding: '7px' },
      '&.MuiButton-sizeFlat': { padding: '13px 24px', height: 'unset' },
      '&:hover': { boxShadow: 'none' },
      '& span.MuiButton-startIcon': {
        marginLeft: '0px',
        marginRight: '6px',
      },
    },
  },
  defaultProps: { disableRipple: false },
};

// Button in Figam: https://bit.ly/3Ky4uvo
export const LightButton: any = {
  ...ButtonCommonProps,
  variants: [
    {
      props: { variant: 'primary' },
      style: getContainedStyles('primary', ltDs),
    },
    {
      props: { variant: 'secondary' },
      style: getOutlinedStyles('primary', ltDs),
    },
    {
      props: { variant: 'tertiary', color: 'primary' },
      style: getTertiaryStyles('primary', ltDs),
    },
    {
      props: { variant: 'tertiary', color: 'secondary' },
      style: getTertiaryStyles('grayscale', ltDs),
    },
    {
      props: { variant: 'destructive' },
      style: {
        backgroundColor: ltDs.sys_magenta_500,
        color: ltDs.white_static,
        ':hover': { backgroundColor: ltDs.sys_magenta_600 },
        ':active': { backgroundColor: ltDs.sys_magenta_700 },
        ':focus': {
          backgroundColor: ltDs.sys_magenta_500,
          outline: '2px solid',
          outlineColor: ltDs.sys_yellow_500,
        },
        '&.Mui-disabled': {
          color: ltDs.white_static,
          backgroundColor: ltDs.sys_magenta_300,
          cursor: 'not-allowed',
          pointerEvents: 'unset',
        },
        '& .MuiLoadingButton-loadingIndicator': { color: ltDs.white_static },
        '& .MuiButton-startIcon svg': { fill: ltDs.white_static },
        '& .MuiButton-startIcon svg path': { fill: ltDs.white_static },
      },
    },
    {
      props: { variant: 'segmented' },
      style: {
        minWidth: 'unset',
        maxWidth: 'unset',
        width: '40px',
        height: '40px',
        padding: '8px',
        color: 'ds.gray_200',
        '&.MuiButton-sizeMedium': { padding: '8px', height: '40px' },
        ':hover': {
          color: 'ds.gray_50',
        },
        '&.active': {
          backgroundColor: ltDs.gray_200,
          ':hover': {
            backgroundColor: ltDs.gray_50,
          },
        },
      },
    },
  ],
};

// Button in Figam: https://bit.ly/3Ky4uvo
export const DarkButton: any = {
  ...ButtonCommonProps,
  variants: [
    {
      props: { variant: 'primary' },
      style: getContainedStyles('primary', dtDs),
    },
    {
      props: { variant: 'secondary' },
      style: getOutlinedStyles('primary', dtDs),
    },
    {
      props: { variant: 'tertiary', color: 'primary' },
      style: getTertiaryStyles('primary', dtDs),
    },
    {
      props: { variant: 'tertiary', color: 'secondary' },
      style: getTertiaryStyles('grayscale', dtDs),
    },
    {
      props: { variant: 'destructive' },
      style: {
        backgroundColor: dtDs.sys_magenta_500,
        color: dtDs.white_static,
        ':hover': { backgroundColor: dtDs.sys_magenta_600 },
        ':active': { backgroundColor: dtDs.sys_magenta_700 },
        ':focus': {
          backgroundColor: dtDs.sys_magenta_500,
          outline: '2px solid',
          outlineColor: dtDs.sys_yellow_500,
        },
        '&.Mui-disabled': {
          color: dtDs.white_static,
          backgroundColor: dtDs.sys_magenta_300,
          cursor: 'not-allowed',
          pointerEvents: 'unset',
        },
        '& .MuiLoadingButton-loadingIndicator': { color: dtDs.white_static },
        '& .MuiButton-startIcon svg': { fill: dtDs.white_static },
        '& .MuiButton-startIcon svg path': { fill: dtDs.white_static },
      },
    },
  ],
};

function getContainedStyles(variant: 'primary' | 'secondary', themePalette: Object): Object {
  return {
    backgroundColor: themePalette[`${variant}_500`],
    color: themePalette.white_static,
    ':hover': { backgroundColor: themePalette[`${variant}_600`] },
    ':active': { backgroundColor: themePalette[`${variant}_700`] },
    ':focus': {
      backgroundColor: themePalette[`${variant}_500`],
      outline: '2px solid',
      outlineColor: themePalette.sys_yellow_500,
    },
    '&.Mui-disabled': {
      color: themePalette.gray_min,
      backgroundColor: themePalette[`${variant}_200`],
      opacity: '0.8',
      cursor: 'not-allowed',
      pointerEvents: 'unset',
    },
    '& .MuiLoadingButton-loadingIndicator': { color: themePalette.gray_min },
    '& .MuiButton-startIcon svg': { fill: themePalette.gray_min },
    '& .MuiButton-startIcon svg path': { fill: themePalette.gray_min },
  };
}

function getOutlinedStyles(variant: 'primary' | 'secondary', themePalette: Object): Object {
  return {
    backgroundColor: 'transparent',
    color: themePalette[`${variant}_500`],
    border: '2px solid',
    borderColor: themePalette[`${variant}_500`],
    ':hover': {
      border: '2px solid',
      color: themePalette[`${variant}_600`],
      borderColor: themePalette[`${variant}_600`],
    },
    ':active': { borderColor: themePalette[`${variant}_700`] },
    ':focus': {
      borderColor: themePalette[`${variant}_500`],
      outline: '2px solid',
      outlineColor: themePalette.sys_yellow_500,
    },
    '&.Mui-disabled': {
      border: '2px solid',
      borderColor: themePalette[`${variant}_200`],
      color: themePalette[`${variant}_200`],
      cursor: 'not-allowed',
      pointerEvents: 'unset',
    },
    '& .MuiLoadingButton-loadingIndicator': { color: themePalette[`${variant}_600`] },
    '& .MuiButton-startIcon svg': { fill: themePalette[`${variant}_500`] },
    '& .MuiButton-startIcon svg path': { fill: themePalette[`${variant}_500`] },
  };
}

function getTertiaryStyles(variant: 'primary' | 'grayscale', themePalette: Object): Object {
  return {
    backgroundColor: 'transparent',
    color: themePalette[`${variant}_500`],
    ':hover': {
      backgroundColor: themePalette.gray_50,
      color: themePalette[`${variant}_600`],
    },
    ':active': {
      backgroundColor: themePalette.gray_100,
      color: themePalette[`${variant}_700`],
    },
    ':focus': {
      outline: '2px solid',
      outlineColor: themePalette.sys_yellow_500,
    },
    '&.Mui-disabled': {
      border: '2px solid',
      borderColor: themePalette[`${variant}_200`],
      color: themePalette[`${variant}_200`],
      cursor: 'not-allowed',
      pointerEvents: 'unset',
    },
    '& .MuiLoadingButton-loadingIndicator': { color: themePalette[`${variant}_600`] },
    '& .MuiButton-startIcon svg': { fill: themePalette[`${variant}_500`] },
    '& .MuiButton-startIcon svg path': { fill: themePalette[`${variant}_500`] },
  };
}
