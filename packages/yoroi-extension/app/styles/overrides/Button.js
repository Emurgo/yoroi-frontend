// @flow

import { lightTheme } from '../themes/light-theme-base';
import { darkTheme } from '../themes/dark-theme-base';

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
      style: ({ theme }) => getContainedStyles('primary', theme),
    },
    {
      props: { variant: 'secondary' },
      style: ({ theme }) => getOutlinedStyles('primary', theme),
    },
    {
      props: { variant: 'tertiary', color: 'primary' },
      style: getTertiaryStyles('primary', lightTheme),
    },
    {
      props: { variant: 'tertiary', color: 'secondary' },
      style: getTertiaryStyles('grayscale', lightTheme),
    },
    {
      props: { variant: 'destructive' },
      style: getContainedStyles('magenta', lightTheme),
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
          backgroundColor: lightTheme.palette.grayscale[200],
          ':hover': {
            backgroundColor: lightTheme.palette.grayscale[50],
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
      style: getContainedStyles('primary', darkTheme),
    },
    {
      props: { variant: 'secondary' },
      style: getOutlinedStyles('primary', darkTheme),
    },
    {
      props: { variant: 'tertiary', color: 'primary' },
      style: getTertiaryStyles('primary', darkTheme),
    },
    {
      props: { variant: 'tertiary', color: 'secondary' },
      style: getTertiaryStyles('grayscale', darkTheme),
    },
    {
      props: { variant: 'destructive' },
      style: getContainedStyles('magenta', darkTheme),
    },
  ],
};

function getContainedStyles(variant: 'primary' | 'secondary' | 'magenta', theme: Object): Object {
  return {
    backgroundColor: theme.palette[variant].main,
    color: theme.palette.common.white,
    ':hover': {
      backgroundColor: theme.palette[variant][600],
    },
    ':active': {
      backgroundColor: theme.palette[variant][700],
    },
    ':focus': {
      backgroundColor: theme.palette[variant][500],
      outline: '2px solid',
      outlineColor: theme.palette.yellow[500],
    },
    '&.Mui-disabled': {
      color: theme.palette.common.white,
      backgroundColor: theme.palette[variant][300],
      cursor: 'not-allowed',
      pointerEvents: 'unset',
    },
    '& .MuiLoadingButton-loadingIndicator': {
      color: theme.palette.common.white,
    },
    '& .MuiButton-startIcon svg': {
      fill: theme.palette.common.white,
    },
    '& .MuiButton-startIcon svg path': {
      fill: theme.palette.common.white,
    },
  };
}

function getOutlinedStyles(variant: 'primary' | 'secondary', theme: Object): Object {
  return {
    backgroundColor: 'transparent',
    color: theme.palette[variant][500],
    border: '2px solid',
    borderColor: theme.palette[variant][500],
    ':hover': {
      border: '2px solid',
      color: theme.palette[variant][600],
      borderColor: theme.palette[variant][600],
    },
    ':active': {
      borderColor: theme.palette[variant][700],
    },
    ':focus': {
      borderColor: theme.palette[variant][500],
      outline: '2px solid',
      outlineColor: theme.palette.yellow[500],
    },
    '&.Mui-disabled': {
      border: '2px solid',
      borderColor: theme.palette[variant][200],
      color: theme.palette[variant][200],
      cursor: 'not-allowed',
      pointerEvents: 'unset',
    },
    '& .MuiLoadingButton-loadingIndicator': {
      color: theme.palette[variant][600],
    },
    '& .MuiButton-startIcon svg': {
      fill: theme.palette[variant][500],
    },
    '& .MuiButton-startIcon svg path': {
      fill: theme.palette[variant][500],
    },
  };
}

function getTertiaryStyles(variant: 'primary' | 'grayscale', theme: Object): Object {
  return {
    backgroundColor: 'transparent',
    color: theme.palette[variant][500],
    ':hover': {
      backgroundColor: theme.palette.grayscale[50],
      color: theme.palette[variant][600],
    },
    ':active': {
      backgroundColor: theme.palette.grayscale[100],
      color: theme.palette[variant][700],
    },
    ':focus': {
      outline: '2px solid',
      outlineColor: theme.palette.yellow[500],
    },
    '&.Mui-disabled': {
      border: '2px solid',
      borderColor: theme.palette[variant][200],
      color: theme.palette[variant][200],
      cursor: 'not-allowed',
      pointerEvents: 'unset',
    },
    '& .MuiLoadingButton-loadingIndicator': {
      color: theme.palette[variant][600],
    },
    '& .MuiButton-startIcon svg': {
      fill: theme.palette[variant][500],
    },
    '& .MuiButton-startIcon svg path': {
      fill: theme.palette[variant][500],
    },
  };
}
