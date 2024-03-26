// @flow
import { createTheme } from '@mui/material/styles';

/* Common settings for colors, typography, shapes */
export const commonTheme: Object = createTheme({
  palette: {
    error: {
      main: '#FF1351',
      '50': '#FFF3F5',
      '100': '#FF1351',
      '200': '#CD0E41',
    },
    warning: {
      main: '#f6a823',
    },
    cyan: {
      '50': '#F2F9FF',
      '100': '#59B1F4',
    },
    gray: {
       min: '#ffffff',
      '50': '#F0F3F5',
      '100': '#EAEDF2',
      '200': '#DCE0E9',
      '300': '#C4CAD7',
      '400': '#A7AFC0',
      '500': '#8A92A3',
      '600': '#6B7384',
      '700': '#4A5065',
      '800': '#383E54',
      '900': '#242838',
       max: '#000000',
    },
    background: {
      overlay: '#060d23cc', // dialogs,
    },
    txStatus: {
      pending: {
        background: '#F0F3F5',
        text: '#ADAEB6',
        stripes: 'rgba(217, 221, 224, 0.6)',
      },
      high: {
        background: '#c9ede5',
        text: '#17cfa7',
      },
      failed: {
        background: '#ff145380',
        text: '#e6003d',
      },
      medium: {
        background: '#f5a5244d',
        text: '#f5a524',
      },
      low: {
        background: '#ff145326',
        text: '#FA5F88',
      },
    },
  },
});
