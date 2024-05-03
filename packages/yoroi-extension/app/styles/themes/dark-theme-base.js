// @flow
import { alpha } from '@mui/material/styles';
import { dark } from './themed-palettes/dark';

const primary = {
  main: '#4B6DDE',
  '900': '#E4E8F7',
  '800': '#C4CFF5',
  '700': '#A0B3F2',
  '600': '#7892E8',
  '500': '#4B6DDE',
  '400': '#2E4BB0',
  '300': '#304489',
  '200': '#242D4F',
  '100': '#1F253B',
};

const secondary = {
  main: '#16E3BA',
  '100': '#17453C',
  '200': '#12705D',
  '300': '#0B997D',
  '400': '#08C29D',
  '500': '#16E3BA',
  '600': '#66F2D6',
  '700': '#93F5E1',
  '800': '#C6F7ED',
  '900': '#E4F7F3',
};

const grayscale = {
  main: '#656C85',
  min: '#0B0B0F',
  '50': '#15171F',
  '100': '#1F232E',
  '200': '#262A38',
  '300': '#3E4457',
  '400': '#4B5266',
  '500': '#656C85',
  '600': '#7C85A3',
  '700': '#9BA4C2',
  '800': '#BCC5E0',
  '900': '#E1E6F5',
  max: '#FFFFFF',
};

const staticColors = { white: '#FFFFFF', black: '#000000' };

const cyan = { '500': '#59B1F4', '100': '#112333' };
const yellow = { '500': '#ECBA09', '100': '#31290E' };
const orange = { '500': '#FAB357', '100': '#291802' };
const magenta = {
  main: '#FF7196',
  '700': '#9B1F40',
  '600': '#CF335B',
  '500': '#FF7196',
  '300': '#64303E',
  '100': '#3B252A',
};

const system = { magenta, cyan, yellow, orange };

export const darkThemeBase = {
  name: 'dark-theme',
  palette: {
    mode: 'dark',
    /* `main` is added since MUI required it but we don't use it at all */
    ds: {
      ...dark,
    },
    primary,
    secondary,
    grayscale,
    static: staticColors,
    system,
    gradients: {
      bg_gradient_1:
        'linear-gradient(195.39deg, rgba(26, 227, 187, 0.26) 0.57%, rgba(75, 109, 222, 0.1) 41.65%, rgba(75, 109, 222, 0.16) 100%)',
      bg_gradient_2:
        'linear-gradient(205.51deg, rgba(11, 153, 125, 0.49) -10.43%, rgba(8, 194, 157, 0.08) 100%)',
      bg_gradient_3: 'linear-gradient(30.09deg, #244ABF 0%, #4760FF 176.73%)',
    },
    background: { bg_color_low: dark.gray_cmin, bg_color_medium: grayscale['100'] },
    uitext: {
      primary: {
        high: primary['700'],
        normal: primary['600'],
        low: primary['300'],
      },
      on_primary: staticColors.white,
      gray: {
        max: dark.gray_cmax,
        normal: grayscale['900'],
        medium: grayscale['600'],
        low: grayscale['400'],
      },
      error: system.magenta['500'],
      warning: system.orange['500'],
      success: secondary['500'],
      info: system.cyan['500'],
    },
    ui: {
      primary: {
        high: primary['700'],
        normal: primary['600'],
        low: primary['300'],
      },
      gray: {
        high: dark.gray_cmax,
        normal: grayscale['900'],
        medium: grayscale['600'],
        low: grayscale['400'],
      },
      secondary: {
        medium: secondary['400'],
      },
      static: {
        white: staticColors.white,
      },
    },
    special: {
      overlay: alpha(grayscale['100'], 0.8),
      bg_sidebar_item: alpha(staticColors.black, 0.16),
      el_sidebar_item: alpha(staticColors.white, 0.48),
    },
  },
  shape: {
    borderRadius: 8,
  },
};
