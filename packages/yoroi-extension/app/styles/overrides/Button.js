// @flow

import { darkThemeBase } from '../themes/dark-theme-base';
import { lightThemeBase } from '../themes/light-theme-base';

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

// Button in Figma: https://bit.ly/3Ky4uvo
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
      cursor: 'not-allowed',
      pointerEvents: 'unset',
    },
    '&.MuiLoadingButton-root.Mui-disabled': {
      backgroundColor: themePalette.primary_200,
    },
    '& .MuiLoadingButton-loadingIndicator': { color: themePalette.white_static },
    '& .MuiButton-startIcon svg': { fill: themePalette.white_static },
    '& .MuiButton-startIcon svg path': { fill: themePalette.white_static },
  };
}

function getOutlinedStyles(variant: 'primary' | 'secondary', themePalette: Object): Object {
  return {
    backgroundColor: 'transparent',
    color: themePalette.text_primary_medium,
    border: '2px solid',
    borderColor: themePalette.el_primary_medium,
    ':hover': {
      border: '2px solid',
      color: themePalette.text_primary_max,
      backgroundColor: themePalette.primary_100,
      borderColor: themePalette.el_primary_max,
    },
    ':pressed': {
      border: '2px solid',
      color: themePalette.text_primary_max,
      backgroundColor: themePalette.primary_200,
      borderColor: themePalette.el_primary_max,
    },
    ':active': {
      borderColor: themePalette.el_primary_max,
      color: themePalette.text_primary_max,
    },
    ':focus': {
      borderColor: themePalette.el_primary_medium,
      color: themePalette.text_primary_medium,
      outline: '2px solid',
      outlineColor: themePalette.sys_yellow_500,
    },
    '&.Mui-disabled': {
      border: '2px solid',
      borderColor: themePalette.el_primary_low,
      color: themePalette.text_primary_low,
      cursor: 'not-allowed',
      pointerEvents: 'unset',
    },
    '& .MuiLoadingButton-loadingIndicator': { color: themePalette[`${variant}_600`] },
    '& .MuiLoadingButton-root': { backgroundColor: themePalette.primary_500 },
    '& .MuiButton-startIcon svg': { fill: themePalette[`${variant}_500`] },
    '& .MuiButton-startIcon svg path': { fill: themePalette[`${variant}_500`] },
  };
}

function getTertiaryStyles(variant: 'primary' | 'grayscale', themePalette: Object): Object {
  return {
    backgroundColor: 'transparent',
    color: themePalette.text_primary_medium,
    ':hover': {
      backgroundColor: themePalette[`${variant}_100`],
      color: variant === 'primary' ? themePalette.text_primary_max : themePalette.text_gray_max,
      '& .MuiButton-startIcon svg': { fill: variant === 'primary' ? themePalette.text_primary_max : themePalette.text_gray_max },
      '& .MuiButton-startIcon svg path': { fill: variant === 'primary' ? themePalette.text_primary_max : themePalette.text_gray_max },
    },
    ':active': {
      backgroundColor: themePalette.gray_100,
      color: themePalette[`${variant}_700`],
      '& .MuiButton-startIcon svg': { fill: themePalette[`${variant}_700`] },
      '& .MuiButton-startIcon svg path': { fill: themePalette[`${variant}_700`] },
    },
    ':focus': {
      outline: '2px solid',
      outlineColor: themePalette.sys_yellow_500,
    },
    ':disabled': {
      color: variant === 'primary' ? themePalette.text_primary_min : themePalette.text_gray_min,
      cursor: 'not-allowed',
      pointerEvents: 'unset',
      '& .MuiButton-startIcon svg': { fill: variant === 'primary' ? themePalette.text_primary_min : themePalette.text_gray_min },
      '& .MuiButton-startIcon svg path': { fill: variant === 'primary' ? themePalette.text_primary_min : themePalette.text_gray_min },
    },
    '&.Mui-disabled': {
      color: variant === 'primary' ? themePalette.text_primary_min : themePalette.text_gray_min,
      cursor: 'not-allowed',
      pointerEvents: 'unset',
      opacity: 1,
      '& .MuiButton-startIcon svg': { fill: variant === 'primary' ? themePalette.text_primary_min : themePalette.text_gray_min },
      '& .MuiButton-startIcon svg path': { fill: variant === 'primary' ? themePalette.text_primary_min : themePalette.text_gray_min },
    },
    '& .MuiLoadingButton-loadingIndicator': { color: themePalette[`${variant}_600`] },
    '& .MuiButton-startIcon svg': { fill: themePalette.text_primary_medium },
    '& .MuiButton-startIcon svg path': { fill: themePalette.text_primary_medium },
  };
}
