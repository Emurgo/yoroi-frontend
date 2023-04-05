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
function makeVariants<T>(token: string, variant: T) {
  const styles = { ...variant, fontFamily, fontWeight: 400 };
  return {
    [`${token}-regular`]: styles,
    [`${token}-medium`]: {
      ...styles,
      fontWeight: 500,
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
    },
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily,
    // token: h1-regular & h1-medium
    ...makeVariants('h1', {
      fontSize: '1.875rem', // 30px
      lineHeight: '38px',
    }),
    // token: h2-regular & h2-medium
    ...makeVariants('h2', {
      fontSize: '1.75rem', // 28px
      lineHeight: '32px',
    }),
    // token: h3-regular & h3-medium
    ...makeVariants('h3', {
      fontSize: '1.5rem', // 24px
      lineHeight: '32px',
    }),
    // token: h4-regular & h4-medium
    ...makeVariants('h4', {
      fontSize: '1.25rem', // 20px
      lineHeight: '28px',
    }),
    // token: h5-regular & h5-medium
    ...makeVariants('h5', {
      fontSize: '1.125rem', // 18px
      lineHeight: '26px',
    }),
    button1: {
      fontSize: '1rem', // 16px
      fontWeight: 500,
      lineHeight: '22px',
      letterSpacing: '0.5px',
      textTransform: 'uppercase',
      fontFamily,
    },
    button2: {
      fontSize: '0.875rem', // 14px
      fontWeight: 400,
      lineHeight: '22px',
      letterSpacing: '0.5px',
      textTransform: 'uppercase',
      fontFamily,
    },
    // token:  body-1-regular & body-1-medium
    ...makeVariants('body-1', {
      fontSize: '1rem', // 16px
      lineHeight: '24px',
    }),
    // token: body-2-regular & body-2-medium
    ...makeVariants('body-2', {
      fontSize: '0.875rem', // 14px
      lineHeight: '24px',
    }),
    overline: {
      fontWeight: 400,
      fontSize: '0.875rem', // 14px
      lineHeight: '22px',
      textTransform: 'uppercase',
      fontFamily,
    },
    // token: caption-1-regular & caption-2-medium
    ...makeVariants('caption-1', {
      fontSize: '0.75rem', // 12px
      lineHeight: '16px',
    }),
    // token: caption-2-regular & caption-2-medium
    ...makeVariants('caption-1', {
      fontSize: '0.625rem', // 10px
      lineHeight: '14px',
    }),
  },
};
export const revampTheme: Object = createTheme(deepmerge(commonTheme, theme));
