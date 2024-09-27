/* eslint-disable no-nested-ternary */
// @flow
import type { Node } from 'react';
import { GlobalStyles } from '@mui/material';
import type { DSColorPalette } from './themes/types';

const getColorPath = (themePalette: any, color: string) => {
  const path = [];
  for (const entery of Object.entries(themePalette)) {
    const [key, value] = entery;
    if (typeof value === 'object') {
      // $FlowFixMe[incompatible-call]
      for (const valueEntery of Object.entries(value)) {
        if (valueEntery[1] === color) {
          path.push(key, valueEntery[0]);
          break;
        }
      }
    }

    if (path.length !== 0) break;
  }
  return path;
};

export type DesignToken = {|
  parent: string,
  child: string,
  hex: string,
  path: string[],
|};

type NameToHex = {|
  name: string,
  hex: string,
|};

type FormatedPalette = {|
  designTokens: DesignToken[],
  nameToHex: NameToHex[],
|};

export const formatPalette = (palette: any, theme: any): FormatedPalette => {
  const formatedPalette: FormatedPalette = {
    nameToHex: [],
    designTokens: [],
  };

  for (const name of Object.keys(palette)) {
    if (typeof palette[name] === 'string' && palette[name].startsWith('var')) {
      const secondColorName = palette[name].slice(4, -1);
      const secondColorHex = palette[secondColorName];
      const path = getColorPath(theme.palette, secondColorHex);
      formatedPalette.designTokens.push({
        parent: name,
        child: secondColorName,
        hex: secondColorHex,
        path,
      });
    } else {
      formatedPalette.nameToHex.push({
        name,
        hex: palette[name],
      });
    }
  }

  return formatedPalette;
};

type ColorPaletteForStyles = {|
  name: 'modern' | 'classic' | 'revamp-light',
  palette: {|
    ds: DSColorPalette,
  |},
|};

export function getMainYoroiPalette(theme: ColorPaletteForStyles): { [string]: string | number } {
  // if (theme.name === 'light-theme' || theme.name === 'dark-theme') return {};

  return {
    /*
      CSS variables follow the same name as mui using kebab case syntax
      expect from `theme` that is renamed to `th`
      to not get in trouble with previous CSS variables for revamp

      Note:
       Make sure the colors you'll use in any part of UI is using CSS Variables from BASE COLORS.
       Whenever you are adding a new color, add it in MUI theme object and then called it in BASE
       to keep consistency and allow users to override few options from BASE if they want to
    */
    /* === BASE === */
    '--yoroi-palette-common-white': theme.palette.ds.white_static,
    '--yoroi-palette-common-black': theme.palette.ds.black_static,

    '--yoroi-palette-primary-50': theme.palette.ds.primary_100,
    '--yoroi-palette-primary-100': theme.palette.ds.primary_100,
    '--yoroi-palette-primary-200': theme.palette.ds.primary_200,
    '--yoroi-palette-primary-300': theme.palette.ds.primary_300,
    '--yoroi-palette-primary-contrastText': theme.palette.ds.text_gray_medium,

    '--yoroi-palette-secondary-50': theme.palette.ds.primary_100,
    '--yoroi-palette-secondary-100': theme.palette.ds.primary_100,
    '--yoroi-palette-secondary-200': theme.palette.ds.primary_200,
    '--yoroi-palette-secondary-300': theme.palette.ds.primary_300,
    '--yoroi-palette-secondary-contrastText': theme.palette.ds.text_gray_medium,

    '--yoroi-palette-error-50': theme.palette.ds.text_error,
    '--yoroi-palette-error-100': theme.palette.ds.sys_magenta_100,
    '--yoroi-palette-error-200': theme.palette.ds.sys_magenta_300,

    '--yoroi-palette-cyan-50': theme.palette.ds.sys_cyan_100,
    '--yoroi-palette-cyan-100': theme.palette.ds.sys_cyan_500,

    '--yoroi-palette-gray-50': theme.palette.ds.gray_50,
    '--yoroi-palette-gray-100': theme.palette.ds.gray_100,
    '--yoroi-palette-gray-200': theme.palette.ds.gray_200,
    '--yoroi-palette-gray-300': theme.palette.ds.gray_300,
    '--yoroi-palette-gray-400': theme.palette.ds.gray_400,
    '--yoroi-palette-gray-500': theme.palette.ds.gray_500,
    '--yoroi-palette-gray-600': theme.palette.ds.gray_600,
    '--yoroi-palette-gray-700': theme.palette.ds.gray_700,
    '--yoroi-palette-gray-800': theme.palette.ds.gray_800,
    '--yoroi-palette-gray-900': theme.palette.ds.gray_900,
    '--yoroi-palette-gray-max': theme.palette.ds.black_static,
    '--yoroi-palette-gray-min': theme.palette.ds.white_static,
    '--yoroi-palette-background-overlay': theme.palette.ds.bg_gradient_1,

    '--yoroi-palette-tx-status-pending-background': theme.palette.ds.web_overlay,
    '--yoroi-palette-tx-status-pending-text': theme.palette.ds.text_gray_medium,
    '--yoroi-palette-tx-status-pending-stripes': theme.palette.ds.gray_200,
    '--yoroi-palette-tx-status-high-background': theme.palette.ds.el_gray_max,
    '--yoroi-palette-tx-status-high-text': theme.palette.ds.text_gray_medium,
    '--yoroi-palette-tx-status-failed-background': theme.palette.ds.sys_magenta_300,
    '--yoroi-palette-tx-status-failed-text': theme.palette.ds.text_error,
    '--yoroi-palette-tx-status-medium-background': theme.palette.ds.gray_300,
    '--yoroi-palette-tx-status-medium-text': theme.palette.ds.text_gray_medium,
    '--yoroi-palette-tx-status-low-background': theme.palette.ds.sys_magenta_100,
    '--yoroi-palette-tx-status-low-text': theme.palette.ds.text_gray_low,

    '--yoroi-palette-background-banner-warning': theme.palette.ds.sys_orange_500,
    '--yoroi-palette-background-walletAdd-title': theme.palette.ds.text_gray_medium,
    '--yoroi-palette-background-walletAdd-subtitle': theme.palette.ds.text_gray_low,

    /* === BUTTON === */
    // button primary variant
    '--yoroi-comp-button-primary-background': 'var(--yoroi-palette-secondary-300)',
    '--yoroi-comp-button-primary-background-hover': 'var(--yoroi-palette-secondary-200)',
    '--yoroi-comp-button-primary-background-active': 'var(--yoroi-palette-secondary-300)',
    '--yoroi-comp-button-primary-text': 'var(--yoroi-palette-secondary-contrastText)',
    // button secondary variant
    '--yoroi-comp-button-secondary-background': 'transparent',
    '--yoroi-comp-button-secondary-background-hover': 'var(--yoroi-palette-secondary-50)',
    '--yoroi-comp-button-secondary-background-active': 'transparent',
    '--yoroi-comp-button-secondary-border': 'var(--yoroi-palette-secondary-300)',
    '--yoroi-comp-button-secondary-border-hover': 'var(--yoroi-palette-secondary-200)',
    '--yoroi-comp-button-secondary-text': 'var(--yoroi-palette-secondary-300)',
    '--yoroi-comp-button-secondary-text-active': 'var(--yoroi-palette-secondary-300)',
    // danger button
    '--yoroi-comp-button-danger-background': 'var(--yoroi-palette-error-200)',
    '--yoroi-comp-button-danger-background-hover': 'var(--yoroi-palette-error-100)',
    '--yoroi-comp-button-danger-background-active': 'var(--yoroi-palette-error-200)',
    '--yoroi-comp-button-danger-text': 'var(--yoroi-palette-common-white)',
    // [CLASSIC:deprecated] secondary variant
    '--yoroi-comp-button-flat-background': '#fbf5f4',
    '--yoroi-comp-button-flat-background-hover': '#F1EDEE',
    '--yoroi-comp-button-flat-background-active': '#EBE9EA',
    '--yoroi-comp-button-flat-background-disabled': '#F1F3F5',
    '--yoroi-comp-button-flat-text-disabled': '#121326',
    '--yoroi-comp-button-flat-text': '#121326',

    /* === CHECKBOX === */
    '--yoroi-comp-checkbox-border': 'var(--yoroi-palette-gray-900)',
    '--yoroi-comp-checkbox-border-disabled': 'var(--yoroi-palette-gray-200)',
    '--yoroi-comp-checkbox-background-active': 'var(--yoroi-palette-secondary-300)',
    '--yoroi-comp-checkbox-text': 'var(--yoroi-palette-gray-900)',

    /* === TEXTFIELD === */
    '--yoroi-comp-input-error': 'var(--yoroi-palette-error-100)',
    '--yoroi-comp-input-background': 'transparent',
    '--yoroi-comp-input-background-disabled': 'transparent',
    '--yoroi-comp-input-border': 'var(--yoroi-palette-gray-400)',
    '--yoroi-comp-input-border-disabled': 'var(--yoroi-palette-gray-200)',
    '--yoroi-comp-input-border-focus': 'var(--yoroi-palette-gray-900)',
    '--yoroi-comp-input-placeholder': 'var(--yoroi-palette-gray-400)',
    '--yoroi-comp-input-placeholder-disabled': 'var(--yoroi-palette-gray-200)',
    '--yoroi-comp-input-text': 'var(--yoroi-palette-gray-900)',
    '--yoroi-comp-input-text-focus': 'var(--yoroi-palette-gray-900)',
    '--yoroi-comp-input-text-disabled': 'var(--yoroi-palette-gray-200)',
    '--yoroi-comp-input-helper-text': 'var(--yoroi-palette-gray-600)',
    '--yoroi-comp-input-helper-text-disabled': 'var(--yoroi-palette-gray-200)',

    /* === SELECT === */
    '--yoroi-comp-menu-icon': 'var(--yoroi-palette-gray-600)',
    '--yoroi-comp-menu-item-background': 'var(--yoroi-palette-common-white)',
    '--yoroi-comp-menu-item-background-highlighted': 'var(--yoroi-palette-gray-50)',
    '--yoroi-comp-menu-item-checkmark': 'var(--yoroi-palette-secondary-300)',
    '--yoroi-comp-menu-item-text': 'var(--yoroi-palette-gray-900)',

    /* === TABS === */
    '--yoroi-comp-tabs-background': 'var(--yoroi-palette-common-white)',
    '--yoroi-comp-tabs-text': 'var(--yoroi-palette-gray-600)',
    '--yoroi-comp-tabs-text-active': 'var(--yoroi-palette-secondary-300)',
    '--yoroi-comp-tabs-text-disabled': 'var(--yoroi-palette-gray-400)',

    /* === TOOLTIP === */
    '--yoroi-comp-tooltip-background': 'var(--yoroi-palette-gray-700)',
    '--yoroi-comp-tooltip-text': 'var(--yoroi-palette-common-white)',

    /* === MODAL === */
    '--yoroi-comp-dialog-background': 'var(--yoroi-palette-common-white)',
    '--yoroi-comp-dialog-text': 'var(--yoroi-palette-gray-900)',
    '--yoroi-comp-dialog-overlay-background-color': 'var(--yoroi-palette-background-overlay)',
    '--yoroi-comp-dialog-min-width-md': '540px',
    '--yoroi-comp-dialog-min-width-lg': '600px',

    '--yoroi-sidebar-text': theme.palette.ds.text_gray_medium,
    '--yoroi-sidebar-background': `linear-gradient(22.58deg, ${theme.palette.ds.el_primary_medium} 0%, ${theme.palette.ds.el_primary_min} 100%)`,
    '--yoroi-sidebar-end': theme.palette.ds.el_primary_min,

    '--yoroi-notification-message-background': 'rgba(21, 209, 170, 0.8)',

    /* === QR CODE === */
    '--yoroi-qr-code-background': 'transparent',
    '--yoroi-qr-code-foreground': 'var(--yoroi-palette-gray-800)',

    /* === TODO: FIX AND UNIFY ALL CSS VARIABLES === */
    '--yoroi-wallet-add-option-dialog-item-title-color': 'var(--yoroi-palette-gray-900)',
    '--yoroi-wallet-add-option-dialog-item-learn-more-button-bg-color': 'var(--yoroi-palette-gray-50)',
    '--yoroi-transactions-icon-type-expend-background-color': '#15d1aa',
    '--yoroi-transactions-icon-type-income-background-color': '#9ab2d9',
    '--yoroi-transactions-icon-type-exchange-background-color': '#10aca4',
    '--yoroi-transactions-icon-type-failed-background-color': '#eb6d7a',
    '--yoroi-scrollbar-thumb-background': '#c8ccce',
    '--yoroi-warning-box-bg-shadow': '0 2px 40px 0 rgba(242, 242, 242, 0.5)',
    '--yoroi-topbar-height': '64px',
    '--yoroi-navigation-tab-height': theme.name === 'classic' ? '45px' : '64px',
    '--yoroi-widgets-hash-dark': theme.name === 'classic' ? '#000000' : '#464749',
    '--yoroi-widgets-hash-light': theme.name === 'classic' ? '#929293' : '#adaeb6',
    '--yoroi-send-confirmation-dialog-send-values-color': theme.name === 'classic' ? '#ea4c5b' : '#15d1aa',

    '--yoroi-hw-connect-dialog-middle-block-common-background-color': theme.name === 'classic' ? '#f3f3f5' : '#ffffff',
    '--yoroi-hw-connect-dialog-middle-block-common-error-background-color': theme.name === 'classic' ? '#fdf1f0' : '#ffffff',

    '--yoroi-terms-of-use-text-color':
      theme.name === 'classic' ? '#121327' : theme.name === 'revamp-light' ? '#242838' : '#38293d',
    '--yoroi-loading-background-color': '#fafbfc',

    '--yoroi-support-settings-text': theme.name === 'classic' ? '#121327' : '#2b2c32',
    '--yoroi-instructions-text-color': theme.name === 'classic' ? '#121327' : '#adaeb6',
    '--yoroi-mnemonic-background-color-hover': theme.name === 'classic' ? 'rgba(242, 183, 172, 0.12)' : '#f0f3f5',
    '--yoroi-mnemonic-background-color': theme.name === 'classic' ? 'rgba(218, 164, 154, 0.12)' : '#f0f3f5',
    '--yoroi-backup-mnemonic-background-color': 'var(--yoroi-palette-gray-50)',

    ...(theme.name === 'modern'
      ? {
          // Dashboard
          '--yoroi-dashboard-label-underline-color': 'rgba(135, 145, 173, 0.8)',
          '--yoroi-dashboard-card-shadow-color': 'rgba(24, 26, 30, 0.08)',
          '--yoroi-dashboard-card-border-color': 'rgba(77, 32, 192, 0.08)',
          '--yoroi-dashboard-card-vertical-separator-color': '#E6E6E6',
          '--yoroi-dashboard-card-nodelegation-background-color': '#F9FBFF',
          '--yoroi-dashboard-tooltip-background-color': 'rgba(56, 57, 61, 0.75)',
          '--yoroi-dashboard-stakepool-head-background-color': '#F4F6FC',
          '--yoroi-dashboard-epoch-time-background': '#F0F3F5',
          '--yoroi-dashboard-percentage-epoch-base': '#B7C3ED',
          '--yoroi-dashboard-percentage-epoch-circle': '#3154CB',
          '--yoroi-dashboard-percentage-stake-base': '#FFEDF2',
          '--yoroi-dashboard-percentage-stake-circle': '#FF1755',
          '--yoroi-dashboard-graph-tab-color': '#ADAEB6',
          '--yoroi-dashboard-graph-active-tab-color': '#3D60CD',
          '--yoroi-dashboard-graph-radio-color': '#93979C',
          '--yoroi-dashboard-graph-axis-tick-color': '#ADAEB6',
          '--yoroi-dashboard-graph-axis-text-color': '#38393D',
          '--yoroi-dashboard-graph-bar-hover-background-color': '#D9DDE0',
          '--yoroi-dashboard-graph-bar-primary-color': '#6D80FF',
          '--yoroi-dashboard-graph-bar-secondary-color': '#1A44B7',
          '--yoroi-dashboard-graph-bar-width': 16,
          '--yoroi-dashboard-graph-tooltip-text-color': '#FFFFFF',
          '--yoroi-dashboard-graph-tooltip-background': 'rgba(56, 57, 61, 0.7)',
        }
      : null),
  };
}

const globalStyles = (theme: Object): Node => {
  return (
    <GlobalStyles
      styles={{
        ':root': getMainYoroiPalette(theme),

        /* === GLOBAL STYLES === */

        '#root': {
          height: '100%',
        },

        '#root > [data-reactroot]': {
          width: '100%',
          height: '100%',
        },

        // ============ RESET ===========
        // http://meyerweb.com/eric/tools/css/reset

        'html,body,div,span,applet,object,iframe,h1,h2,h3,h4,h5,h6,p,blockquote,pre,a,abbr,acronym,address,big,cite,code,del,dfn,em,img,ins,kbd,q,s,samp,small,strike,strong,sub,sup,tt,var,b,u,i,center,dl,dt,dd,ol,ul,li,fieldset,form,label,legend,table,caption,tbody,tfoot,thead,tr,th,td,article,aside,canvas,details,embed,figure,figcaption,footer,header,hgroup,menu,nav,output,ruby,section,summary,time,mark,audio,video': {
          margin: 0,
          padding: 0,
          border: 0,
          fontSize: '100%',
          font: 'inherit',
          verticalAlign: 'baseline',
        },
        /* HTML5 display-role reset for older browsers */
        'article,aside,details,figcaption,figure,footer,header,hgroup,menu,nav,section': {
          display: 'block',
        },
        'ol,ul': {
          listStyle: 'none',
        },
        table: {
          borderCollapse: 'collapse',
          borderSpacing: 0,
        },

        // Buttons should not have any special style applied by default
        button: {
          background: 'none',
          border: 'none',
          padding: 0,
          fontFamily: 'inherit',
          '&:focus': {
            outline: 0,
          },
        },
        '*': {
          boxSizing: 'border-box',
          '&::-webkit-scrollbar': {
            width: '20px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'var(--yoroi-scrollbar-thumb-background)',
            border: '7px solid transparent',
            borderRadius: '12px',
            backgroundClip: 'content-box',
          },
        },

        // ====== GLOBAL SCROLLBAR STYLE ======
        'html,body,#root,#root > [data-reactroot]': {
          width: '100%',
          height: '100%',
          WebkitFontSmoothing: 'antialiased',
          ':global(.YoroiClassic)': {
            letterSpacing: '1px',
          },
        },
        html: {
          overflow: 'hidden',
        },
        body: {
          /* To remove background color for Chrome Inputs */
          'input:-webkit-autofill,input:-webkit-autofill:hover,input:-webkit-autofill:focus,input:-webkit-autofill:active': {
            WebkitBoxShadow: `0 0 0 30px ${theme.palette.ds.bg_color_max} inset !important`,
          },
          lineHeight: 1,
          fontFamily: theme.typography.fontFamily,
        },
        // ======= RE-USABLE ANIMATIONS =======
        '@keyframes loading-spin': {
          from: {
            transform: 'rotate(0deg)',
          },
          to: {
            transform: 'rotate(360deg)',
          },
        },
        strong: {
          fontWeight: 500,
        },
      }}
    />
  );
};

export { globalStyles };
