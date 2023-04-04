// @flow
import { createTheme } from '@mui/material/styles';
import { RubikFonts, RobotoMonoFonts } from '../fonts';
import {
  ModernButton,
  ModernCheckbox,
  ModernTextField,
  ModernOutlinedInput,
  ModernFormHelperText,
  ModernFormControl,
  ModernMenu,
  ModernMenuItem,
  ModernTabs,
  ModernTabPanel,
  ModernChip,
  ModernTooltip,
  ModernInputLabel,
  ModernSelect,
} from '../overrides';
import { commonTheme } from './common-theme';
import { deepmerge } from '@mui/utils';

const fontFamily = ['Rubik', 'sans-serif'].join(',');

/**
 *
 * @param {*} token typography token: `h1`, `h2`
 * @param {*} variant typography styles object
 * @param {*} mediumWeight typography font weight on medium size
 * @returns
 */
function withMedium(token, variant, mediumWeight: number = 500) {
  return {
    [token]: variant,
    [`${token}-regular`]: variant,
    [`${token}-medium`]: {
      ...variant,
      fontWeight: mediumWeight,
    },
  };
}

const theme = {
  name: 'revamp',
  components: {
    MuiCssBaseline: {
      styleOverrides: `
      ${RubikFonts}
      ${RobotoMonoFonts}
    `,
    },
    MuiButton: ModernButton,
    MuiCheckbox: ModernCheckbox,
    MuiTextField: ModernTextField,
    MuiOutlinedInput: ModernOutlinedInput,
    MuiFormHelperText: ModernFormHelperText,
    MuiFormControl: ModernFormControl,
    MuiSelect: ModernSelect,
    MuiInputLabel: ModernInputLabel,
    MuiMenu: ModernMenu,
    MuiMenuItem: ModernMenuItem,
    MuiTabs: ModernTabs,
    MuiTabPanel: ModernTabPanel,
    MuiChip: ModernChip,
    MuiTooltip: ModernTooltip,
  },
  palette: {
    /* `main` is added since MUI required it but we don't use it at all */
    primary: {
      main: '#3154CB',
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
    },
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily,
    // token: heading-1-regular
    ...withMedium('h1', {
      fontWeight: 400,
      fontSize: '1.875rem', // 30px
      lineHeight: '38px',
      fontFamily,
    }),
    ...withMedium('h2', {
      fontWeight: 400,
      fontSize: '1.75rem', // 28px
      lineHeight: '32px',
      fontFamily,
    }),
    ...withMedium('h3', {
      fontWeight: 400,
      fontSize: '1.5rem', // 24px
      lineHeight: '32px',
      fontFamily,
    }),
    ...withMedium('h4', {
      fontWeight: 400,
      fontSize: '1.25rem', // 20px
      lineHeight: '28px',
      fontFamily,
    }),
    ...withMedium('h5', {
      fontWeight: 400,
      fontSize: '1.125rem', // 18px
      lineHeight: '26px',
      fontFamily,
    }),
    ...withMedium('h6', {
      fontWeight: 400,
      fontSize: '1rem', // 16px
      lineHeight: '26px',
      textTransform: 'uppercase',
      fontFamily,
    }),
    ...withMedium('h7', {
      fontWeight: 400,
      fontSize: '0.875rem',
      fontFamily,
      textTransform: 'uppercase',
    }),
    body1: {
      fontWeight: 400,
      fontSize: '1rem',
      fontFamily,
    },
    body2: {
      fontWeight: 400,
      fontSize: '0.875rem',
      fontFamily,
    },
    body3: {
      fontWeight: 400,
      fontSize: '0.75rem',
      fontFamily,
    },
  },
};
export const revampTheme: Object = createTheme(deepmerge(commonTheme, theme));
