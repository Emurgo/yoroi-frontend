// @flow
import { createTheme } from '@mui/material/styles';
import { commonTheme } from './common-theme';
import { deepmerge } from '@mui/utils';

const fontFamily = ['Rubik', 'sans-serif'].join(',');
const theme = {
  name: 'revamp',
  palette: {
    /* `main` is added since MUI required it but we don't use it at all */
    primary: {
      main: '#4B6DDE',
      '100': '#E4E8F7',
      '200': '#C4CFF5',
      '300': '#A0B3F2',
      '400': '#7892E8',
      '500': '#4B6DDE',
      '600': '#3154CB',
      '700': '#1737A3',
      '800': '#122770',
      '900': '#121F4D',
      contrastText: '#FFF',
    },
    secondary: {
      main: '#16E3BA',
      '100': '#E4F7F3',
      '200': '#C6F7ED',
      '300': '#93F5E1',
      '400': '#66F2D6',
      '500': '#16E3BA',
      '600': '#08C29D',
      '700': '#0B997D',
      '800': '#12705D',
      '900': '#17453C',
      contrastText: '#FFF',
    },
    common: {
      black: '#000000',
      white: '#FFFFFF',
    },
    background: {
      sidebar: {
        start: '#1e46bd',
        end: '#4760ff',
        text: '#FFFFFF',
      },
      banner: {
        warning: '#f5a623',
      },
      walletAdd: {
        title: '#ffffff',
        subtitle: '#ffffff',
      },
      gradients: {
        walletEmptyCard: 'linear-gradient(180deg, #93F5E1 0%, #C6F7ED 100%)',
        primary: 'linear-gradient(269.97deg, #E4E8F7 0%, #C6F7ED 99.98%)',
      },
    },
  },
  shape: {
    borderRadius: 8,
  },
  /**
   * Note: all typography tokens are named based on the regular
   * variant`{token}-{num}-regular` (e.g. `heading-1-regular, body-1-regular`).
   * To create the "medium" vairant, you can overwrite the font-weight to be
   * "fontWeight: 500".
   */
  typography: {
    fontFamily,
    // DS name: heading-1-regular
    h1: {
      fontWeight: 400,
      fontSize: '1.875rem', // 30px
      lineHeight: '38px',
      fontFamily,
    },
    // DS name: heading-2-regular
    h2: {
      fontSize: '1.75rem', // 28px
      lineHeight: '32px',
      fontWeight: 400,
      fontFamily,
    },
    // DS name: heading-3-regular
    h3: {
      fontSize: '1.5rem', // 24px
      lineHeight: '32px',
      fontWeight: 400,
      fontFamily,
    },
    // DS name: heading-4-regular
    h4: {
      fontSize: '1.25rem', // 20px
      lineHeight: '28px',
      fontWeight: 400,
      fontFamily,
    },
    // DS name: heading-5-regular
    h5: {
      fontSize: '1.125rem', // 18px
      lineHeight: '26px',
      fontWeight: 400,
      fontFamily,
    },
    // DS name: button-1
    button: {
      fontSize: '1rem', // 16px
      fontWeight: 500,
      lineHeight: '22px',
      letterSpacing: '0.5px',
      textTransform: 'uppercase',
      fontFamily,
    },
    // DS name: button-2
    button2: {
      fontSize: '0.875rem', // 14px
      fontWeight: 400,
      lineHeight: '22px',
      letterSpacing: '0.5px',
      textTransform: 'uppercase',
      fontFamily,
    },
    // DS name: body-1-regular
    body1: {
      fontSize: '1rem', // 16px
      lineHeight: '24px',
      fontWeight: 400,
      fontFamily,
    },
    // DS name: body-2-regular
    body2: {
      fontSize: '0.875rem', // 14px
      lineHeight: '24px',
      fontWeight: 400,
      fontFamily,
    },
    overline: {
      fontWeight: 400,
      fontSize: '0.875rem', // 14px
      lineHeight: '22px',
      textTransform: 'uppercase',
      fontFamily,
    },
    // DS name: caption-1-regular
    caption1: {
      fontSize: '0.75rem', // 12px
      lineHeight: '16px',
      fontWeight: 400,
      fontFamily,
    },
    // DS name: caption-2-regular
    caption2: {
      fontSize: '0.625rem', // 10px
      lineHeight: '14px',
      fontWeight: 400,
      fontFamily,
    },
  },
};
export const revampBaseTheme: Object = createTheme(deepmerge(commonTheme, theme));
