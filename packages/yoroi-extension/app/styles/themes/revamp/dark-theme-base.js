//@flow
import { dark } from './themed-palettes/dark';

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

export const darkTheme = {
  name: 'revamp-dark',
  palette: {
    mode: 'dark',
    /* `main` is added since MUI required it but we don't use it at all */
    ds: {
      ...dark,
    },
    primary: {
      main: '#17D1AA',
      '900': '#17453C',
      '800': '#12705D',
      '700': '#0B997D',
      '600': '#08C29D',
      '500': '#17D1AA',
      '400': '#66F2D6',
      '300': '#93F5E1',
      '200': '#C6F7ED',
      '100': '#E4F7F3',
      contrastText: '#FFF',
    },
    secondary: {
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
    grayscale: {
      main: '#A7AFC0',
      min: '#000000',
      '50': '#242838',
      '100': '#383E54',
      '200': '#4A5065',
      '300': '#6B7384',
      '400': '#8A92A3',
      '500': '#A7AFC0',
      '600': '#C4CAD7',
      '700': '#DCE0E9',
      '800': '#EAEDF2',
      '900': '#F0F3F5',
      max: '#FFFFFF',
      contrastText: '#000',
    },
    magenta,
    cyan,
    yellow,
    common: { black: '#FFF', white: '#000', magenta, cyan, yellow },
    gradients: {
      'blue-green-bg': 'linear-gradient(180deg, #E4E8F7 0%, #C6F7F7 100%)',
      'blue-green-banner': 'linear-gradient(269.97deg, #E4E8F7 0%, #C6F7ED 100%)',
      green: 'linear-gradient(180deg, #93F5E1 0%, #C6F7ED 100%)',
      blue: 'linear-gradient(30.09deg, #244ABF 0%, #4760FF 176.73%)',
    },
    background: {
      card: '#15171F',
      sidebar: '#121F4D',
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
