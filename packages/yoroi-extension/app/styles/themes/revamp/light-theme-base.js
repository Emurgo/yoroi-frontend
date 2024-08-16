// @flow
import { light } from './themed-palettes/light';

const cyan = { '400': '#59B1F4', '100': '#F2F9FF' };
const yellow = { '500': '#ECBA09', '100': '#FDF7E2' };
const magenta = {
  main: '#FF1351',
  '700': '#CF053A',
  '600': '#E80742',
  '500': '#FF1351',
  '300': '#FBCBD7',
  '100': '#FFF1F5',
};

export const lightTheme = {
  name: 'revamp-light',
  palette: {
    mode: 'light',
    /* `main` is added since MUI required it but we don't use it at all */
    ds: {
      ...light,
    },
    primary: {
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
      contrastText: '#FFF',
    },
    secondary: {
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
      contrastText: '#FFF',
    },
    grayscale: {
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
      min: '#FFFFFF',
      contrastText: '#FFF',
    },
    magenta,
    cyan,
    yellow,
    common: { black: '#000000', white: '#FFFFFF', magenta, cyan, yellow },
    gradients: {
      'blue-green-bg': 'linear-gradient(180deg, #E4E8F7 0%, #C6F7F7 100%)',
      'blue-green-banner': 'linear-gradient(269.97deg, #E4E8F7 0%, #C6F7ED 100%)',
      green: 'linear-gradient(180deg, #93F5E1 0%, #C6F7ED 100%)',
      blue: 'linear-gradient(30.09deg, #244ABF 0%, #4760FF 176.73%)',
    },
    background: {
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
  },
  shape: {
    borderRadius: 8,
  },
};
