// @flow

import { lightThemeBase } from '../themes/light-theme-base';
import { darkThemeBase } from '../themes/dark-theme-base';

const { palette: darkThemePalette } = darkThemeBase;
const { palette: lightThemePalette } = lightThemeBase;

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
      style: getContainedStyles('primary', lightThemePalette),
    },
    {
      props: { variant: 'secondary' },
      style: getOutlinedStyles('primary', lightThemePalette),
    },
    {
      props: { variant: 'tertiary', color: 'primary' },
      style: getTertiaryStyles('primary', lightThemePalette),
    },
    {
      props: { variant: 'tertiary', color: 'secondary' },
      style: getTertiaryStyles('grayscale', lightThemePalette),
    },
    {
      props: { variant: 'destructive' },
      style: {
        backgroundColor: lightThemePalette.system.magenta[500],
        color: lightThemePalette.static.white,
        ':hover': { backgroundColor: lightThemePalette.system.magenta[600] },
        ':active': { backgroundColor: lightThemePalette.system.magenta[700] },
        ':focus': {
          backgroundColor: lightThemePalette.system.magenta[500],
          outline: '2px solid',
          outlineColor: lightThemePalette.system.yellow[500],
        },
        '&.Mui-disabled': {
          color: lightThemePalette.static.white,
          backgroundColor: lightThemePalette.system.magenta[300],
          cursor: 'not-allowed',
          pointerEvents: 'unset',
        },
        '& .MuiLoadingButton-loadingIndicator': { color: lightThemePalette.static.white },
        '& .MuiButton-startIcon svg': { fill: lightThemePalette.static.white },
        '& .MuiButton-startIcon svg path': { fill: lightThemePalette.static.white },
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
        color: 'grayscale.200',
        '&.MuiButton-sizeMedium': { padding: '8px', height: '40px' },
        ':hover': {
          color: 'grayscale.50',
        },
        '&.active': {
          backgroundColor: lightThemePalette.grayscale[200],
          ':hover': {
            backgroundColor: lightThemePalette.grayscale[50],
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
      style: getContainedStyles('primary', darkThemePalette),
    },
    {
      props: { variant: 'secondary' },
      style: getOutlinedStyles('primary', darkThemePalette),
    },
    {
      props: { variant: 'tertiary', color: 'primary' },
      style: getTertiaryStyles('primary', darkThemePalette),
    },
    {
      props: { variant: 'tertiary', color: 'secondary' },
      style: getTertiaryStyles('grayscale', darkThemePalette),
    },
    {
      props: { variant: 'destructive' },
      style: {
        backgroundColor: darkThemePalette.system.magenta[500],
        color: darkThemePalette.static.white,
        ':hover': { backgroundColor: darkThemePalette.system.magenta[600] },
        ':active': { backgroundColor: darkThemePalette.system.magenta[700] },
        ':focus': {
          backgroundColor: darkThemePalette.system.magenta[500],
          outline: '2px solid',
          outlineColor: darkThemePalette.system.yellow[500],
        },
        '&.Mui-disabled': {
          color: darkThemePalette.static.white,
          backgroundColor: darkThemePalette.system.magenta[300],
          cursor: 'not-allowed',
          pointerEvents: 'unset',
        },
        '& .MuiLoadingButton-loadingIndicator': { color: darkThemePalette.static.white },
        '& .MuiButton-startIcon svg': { fill: darkThemePalette.static.white },
        '& .MuiButton-startIcon svg path': { fill: darkThemePalette.static.white },
      },
    },
  ],
};

function getContainedStyles(variant: 'primary' | 'secondary', themePalette: Object): Object {
  return {
    backgroundColor: themePalette[variant][500],
    color: themePalette.static.white,
    ':hover': { backgroundColor: themePalette[variant][600] },
    ':active': { backgroundColor: themePalette[variant][700] },
    ':focus': {
      backgroundColor: themePalette[variant][500],
      outline: '2px solid',
      outlineColor: themePalette.system.yellow[500],
    },
    '&.Mui-disabled': {
      color: themePalette.static.white,
      backgroundColor: themePalette[variant][300],
      cursor: 'not-allowed',
      pointerEvents: 'unset',
    },
    '& .MuiLoadingButton-loadingIndicator': { color: themePalette.static.white },
    '& .MuiButton-startIcon svg': { fill: themePalette.static.white },
    '& .MuiButton-startIcon svg path': { fill: themePalette.static.white },
  };
}

function getOutlinedStyles(variant: 'primary' | 'secondary', themePalette: Object): Object {
  return {
    backgroundColor: 'transparent',
    color: themePalette[variant][500],
    border: '2px solid',
    borderColor: themePalette[variant][500],
    ':hover': {
      border: '2px solid',
      color: themePalette[variant][600],
      borderColor: themePalette[variant][600],
    },
    ':active': { borderColor: themePalette[variant][700] },
    ':focus': {
      borderColor: themePalette[variant][500],
      outline: '2px solid',
      outlineColor: themePalette.system.yellow[500],
    },
    '&.Mui-disabled': {
      border: '2px solid',
      borderColor: themePalette[variant][200],
      color: themePalette[variant][200],
      cursor: 'not-allowed',
      pointerEvents: 'unset',
    },
    '& .MuiLoadingButton-loadingIndicator': { color: themePalette[variant][600] },
    '& .MuiButton-startIcon svg': { fill: themePalette[variant][500] },
    '& .MuiButton-startIcon svg path': { fill: themePalette[variant][500] },
  };
}

function getTertiaryStyles(variant: 'primary' | 'grayscale', themePalette: Object): Object {
  return {
    backgroundColor: 'transparent',
    color: themePalette[variant][500],
    ':hover': {
      backgroundColor: themePalette.grayscale[50],
      color: themePalette[variant][600],
    },
    ':active': {
      backgroundColor: themePalette.grayscale[100],
      color: themePalette[variant][700],
    },
    ':focus': {
      outline: '2px solid',
      outlineColor: themePalette.system.yellow[500],
    },
    '&.Mui-disabled': {
      border: '2px solid',
      borderColor: themePalette[variant][200],
      color: themePalette[variant][200],
      cursor: 'not-allowed',
      pointerEvents: 'unset',
    },
    '& .MuiLoadingButton-loadingIndicator': { color: themePalette[variant][600] },
    '& .MuiButton-startIcon svg': { fill: themePalette[variant][500] },
    '& .MuiButton-startIcon svg path': { fill: themePalette[variant][500] },
  };
}
