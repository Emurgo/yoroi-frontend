//@flow
import { RubikFonts, RobotoMonoFonts } from '../fonts';

const fontFamily = ['Rubik', 'sans-serif'].join(',');

export const commonTheme: Object = {
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        ${RubikFonts}
        ${RobotoMonoFonts}
      `,
    },
  },

  /**
   * Note: all typography tokens are named based on the regular
   * variant`{token}-{num}-regular` (e.g. `heading-1-regular, body-1-regular`).
   * To create the "medium" vairant, you can overwrite the font-weight to be
   * "fontWeight: 500".
   */
  typography: {
    htmlFontSize: 14,
    fontSize: 14,
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
      fontWeight: 500,
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
      lineHeight: '22px',
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
