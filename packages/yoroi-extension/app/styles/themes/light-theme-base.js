// @flow
import { alpha } from '@mui/material/styles';
import { light } from './themed-palettes/light';

const grayscale = {
  main: '#8A92A3',
  max: '#000000',
  '900': '#242838',
  '800': '#383E54',
  '700': '#4A5065',
  '600': '#6B7384',
  '500': '#8A92A3',
  '400': '#A7AFC0',
  '300': '#C4CAD7',
  '200': '#DCE0E9',
  '100': '#EAEDF2',
  '50': '#F0F3F5',
  min: '#FFFFFF', // legacy prop
};

const primary = {
  main: '#4B6DDE',
  '900': '#121F4D',
  '800': '#122770',
  '700': '#1737A3',
  '600': '#3154CB',
  '500': '#4B6DDE',
  '400': '#7892E8',
  '300': '#A0B3F2',
  '200': '#C4CFF5',
  '100': '#E4E8F7',
  contrastText: '#FFF', // legacy prop
};

const secondary = {
  main: '#16E3BA',
  '900': '#17453C',
  '800': '#12705D',
  '700': '#0B997D',
  '600': '#08C29D',
  '500': '#16E3BA',
  '400': '#66F2D6',
  '300': '#93F5E1',
  '200': '#C6F7ED',
  '100': '#E4F7F3',
  contrastText: '#FFF', // legacy prop
};

const staticColors = { white: '#FFFFFF', black: '#000000' };

const cyan = { '500': '#59B1F4', '100': '#E8F4FF' };
const yellow = { '500': '#ECBA09', '100': '#FDF7E2' };
const orange = { '500': '#ED8600', '100': '#FFF2E2' };
const magenta = {
  main: '#FF1351',
  '700': '#CF053A',
  '600': '#E80742',
  '500': '#FF1351',
  '300': '#FBCBD7',
  '100': '#FFF1F5',
};

const system = { magenta, cyan, yellow, orange };

export const lightThemeBase: any = {
  name: 'light-theme',
  palette: {
    mode: 'light',
    /* `main` is added since MUI required it but we don't use it at all */
    ds: {
      ...light,
    },
    primary,
    secondary,
    grayscale,
    static: staticColors,
    system,
    // start legacy props
    magenta,
    cyan,
    yellow,
    common: { black: '#000000', white: '#FFFFFF', magenta, cyan, yellow },
    // end legacy props
    gradients: {
      bg_gradient_1: 'linear-gradient(312.19deg, #C6F7ED 0%, #E4E8F7 100%)',
      bg_gradient_2: 'linear-gradient(180deg, #93F5E1 0%, #C6F7ED 100%)',
      bg_gradient_3: 'linear-gradient(30.09deg, #244ABF 0%, #4760FF 176.73%)',
      // legacy ones
      'blue-green-bg': 'linear-gradient(180deg, #E4E8F7 0%, #C6F7F7 100%)',
      'blue-green-banner': 'linear-gradient(269.97deg, #E4E8F7 0%, #C6F7ED 100%)',
      green: 'linear-gradient(180deg, #93F5E1 0%, #C6F7ED 100%)',
      blue: 'linear-gradient(30.09deg, #244ABF 0%, #4760FF 176.73%)',
    },
    background: {
      bg_color_max: light.gray_min,
      bg_color_medium: grayscale['100'],
      // legacy ones
      card: '#fff',
      sidebar: '#4760FF',
      banner: {
        warning: '#f5a623',
      },
      walletAdd: {
        title: '#ffffff',
        subtitle: '#ffffff',
      },
      gradients: {
        walletEmptyCard: 'linear-gradient(180deg, #93F5E1 0%, #C6F7ED 100%)',
        supportedAddressDomainsBanner: 'linear-gradient(260deg, #E4E8F7 0%, #C6F7ED 100%)',
        primary: 'linear-gradient(269.97deg, #E4E8F7 0%, #C6F7ED 100%)',
      },
    },
    uitext: {
      primary: {
        high: primary['600'],
        normal: primary['500'],
        low: primary['300'],
      },
      on_primary: staticColors.white,
      gray: {
        max: light.gray_max,
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
        high: primary['600'],
        normal: primary['500'],
        low: primary['300'],
      },
      gray: {
        high: light.gray_max,
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
      overlay: alpha(staticColors.black, 0.7),
      bg_sidebar_item: alpha(staticColors.black, 0.16),
      el_sidebar_item: alpha(staticColors.white, 0.48),
    },
  },
  shape: {
    borderRadius: 8,
  },
};
