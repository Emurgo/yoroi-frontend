// @flow
import type { Node } from 'react';
import { GlobalStyles } from '@mui/material';

const globalStyles = (theme: Object): Node => (
  <GlobalStyles
    styles={{
      /*
        CSS variables follow the same name as mui using kebab case syntax
        expect from `theme` that is renamed to `th`
        to not get in trouble with previous CSS variables for revamp

        Note:
         Make sure the colors you'll use in any part of UI is using CSS Variables from BASE COLORS.
         Whenever you are adding a new color, add it in MUI theme object and then called it in BASE
         to keep consistency and allow users to override few options from BASE if they want to
      */

      ':root': {
        /* === BASE === */
        '--th-palette-common-white': theme.palette.common.white,
        '--th-palette-common-black': theme.palette.common.black,

        '--th-palette-primary-50': theme.palette.primary['50'],
        '--th-palette-primary-100': theme.palette.primary['100'],
        '--th-palette-primary-200': theme.palette.primary['200'],
        '--th-palette-primary-300': theme.palette.primary['300'],
        '--th-palette-primary-contrastText': theme.palette.primary.contrastText,

        '--th-palette-secondary-50': theme.palette.secondary['50'],
        '--th-palette-secondary-100': theme.palette.secondary['100'],
        '--th-palette-secondary-200': theme.palette.secondary['200'],
        '--th-palette-secondary-300': theme.palette.secondary['300'],
        '--th-palette-secondary-contrastText': theme.palette.secondary.contrastText,

        '--th-palette-error-50': theme.palette.error['50'],
        '--th-palette-error-100': theme.palette.error['100'],
        '--th-palette-error-200': theme.palette.error['200'],

        '--th-palette-cyan-50': theme.palette.cyan['50'],
        '--th-palette-cyan-100': theme.palette.cyan['100'],

        '--th-palette-gray-50': theme.palette.gray['50'],
        '--th-palette-gray-100': theme.palette.gray['100'],
        '--th-palette-gray-200': theme.palette.gray['200'],
        '--th-palette-gray-300': theme.palette.gray['300'],
        '--th-palette-gray-400': theme.palette.gray['400'],
        '--th-palette-gray-500': theme.palette.gray['500'],
        '--th-palette-gray-600': theme.palette.gray['600'],
        '--th-palette-gray-700': theme.palette.gray['700'],
        '--th-palette-gray-800': theme.palette.gray['800'],
        '--th-palette-gray-900': theme.palette.gray['900'],
        '--th-palette-background-overlay': theme.palette.background.overlay,

        '--th-palette-tx-status-pending-background': theme.palette.txStatus.pending.background,
        '--th-palette-tx-status-pending-text': theme.palette.txStatus.pending.text,
        '--th-palette-tx-status-high-background': theme.palette.txStatus.high.background,
        '--th-palette-tx-status-high-text': theme.palette.txStatus.high.text,
        '--th-palette-tx-status-failed-background': theme.palette.txStatus.failed.background,
        '--th-palette-tx-status-failed-text': theme.palette.txStatus.failed.text,
        '--th-palette-tx-status-medium-background': theme.palette.txStatus.medium.background,
        '--th-palette-tx-status-medium-text': theme.palette.txStatus.medium.text,
        '--th-palette-tx-status-low-background': theme.palette.txStatus.low.background,
        '--th-palette-tx-status-low-text': theme.palette.txStatus.low.text,

        '--th-palette-background-banner-warning': theme.palette.background.banner.warning,

        /* === BUTTON === */
        // button primary variant
        '--component-button-primary-background': 'var(--th-palette-secondary-300)',
        '--component-button-primary-background-hover': 'var(--th-palette-secondary-200)',
        '--component-button-primary-background-active': 'var(--th-palette-secondary-300)',
        '--component-button-primary-text': 'var(--th-palette-secondary-contrastText)',
        // button secondary variant
        '--component-button-secondary-background': 'transparent',
        '--component-button-secondary-background-hover': 'var(--th-palette-secondary-50)',
        '--component-button-secondary-background-active': 'transparent',
        '--component-button-secondary-border': 'var(--th-palette-secondary-300)',
        '--component-button-secondary-border-hover': 'var(--th-palette-secondary-200)',
        '--component-button-secondary-text': 'var(--th-palette-secondary-300)',
        '--component-button-secondary-text-active': 'var(--th-palette-secondary-300)',
        // danger button
        '--component-button-danger-background': 'var(--th-palette-error-200)',
        '--component-button-danger-background-hover': 'var(--th-palette-error-100)',
        '--component-button-danger-background-active': 'var(--th-palette-error-200)',
        '--component-button-danger-text': 'var(--th-palette-common-white)',
        // [CLASSIC:deprecated] secondary variant
        '--component-button-flat-background': '#fbf5f4',
        '--component-button-flat-background-hover': '#F1EDEE',
        '--component-button-flat-background-active': '#EBE9EA',
        '--component-button-flat-background-disabled': '#F1F3F5',
        '--component-button-flat-text-disabled': '#121326',
        '--component-button-flat-text': '#121326',

        /* === CHECKBOX === */
        '--component-checkbox-border': 'var(--th-palette-gray-900)',
        '--component-checkbox-border-disabled': 'var(--th-palette-gray-200)',
        '--component-checkbox-background-active': 'var(--th-palette-secondary-300)',
        '--component-checkbox-text': 'var(--th-palette-gray-900)',

        /* === TEXTFIELD === */
        '--component-input-error': 'var(--th-palette-error-100)',
        '--component-input-background': 'transparent',
        '--component-input-background-disabled': 'transparent',
        '--component-input-border': 'var(--th-palette-gray-400)',
        '--component-input-border-disabled': 'var(--th-palette-gray-200)',
        '--component-input-border-focus': 'var(--th-palette-gray-900)',
        '--component-input-placeholder': 'var(--th-palette-gray-400)',
        '--component-input-placeholder-disabled': 'var(--th-palette-gray-200)',
        '--component-input-text': 'var(--th-palette-gray-900)',
        '--component-input-text-focus': 'var(--th-palette-gray-900)',
        '--component-input-text-disabled': 'var(--th-palette-gray-200)',
        '--component-input-helper-text': 'var(--th-palette-gray-600)',
        '--component-input-helper-text-disabled': 'var(--th-palette-gray-200)',

        /* === SELECT === */
        '--component-menu-icon': 'var(--th-palette-gray-600)',
        '--component-menu-item-background': 'var(--th-palette-common-white)',
        '--component-menu-item-background-highlighted': 'var(--th-palette-gray-50)',
        '--component-menu-item-checkmark': 'var(--th-palette-secondary-300)',
        '--component-menu-item-text': 'var(--th-palette-gray-900)',

        /* === TABS === */
        '--component-tabs-background': 'var(--th-palette-common-white)',
        '--component-tabs-text': 'var(--th-palette-gray-600)',
        '--component-tabs-text-active': 'var(--th-palette-secondary-300)',
        '--component-tabs-text-disabled': 'var(--th-palette-gray-400)',

        /* === TOOLTIP === */
        '--component-tooltip-background': 'var(--th-palette-gray-700)',
        '--component-tooltip-text': 'var(--th-palette-common-white)',

        /* === MODAL === */
        '--component-dialog-background': 'var(--th-palette-common-white)',
        '--component-dialog-text': 'var(--th-palette-gray-900)',
        '--component-dialog-overlay-background-color': 'var(--th-palette-background-overlay)',
        '--component-dialog-min-width-cmn': '540px',

        '--th-sidebar-text': theme.palette.background.sidebar.text,
        '--th-sidebar-background': `linear-gradient(22.58deg, ${theme.palette.background.sidebar.start} 0%, ${theme.palette.background.sidebar.end} 100%)`,
        '--th-sidebar-end': theme.palette.background.sidebar.end,

        '--th-notification-message-background': 'rgba(21, 209, 170, 0.8)',

        /* === QR CODE === */
        '--th-qr-code-background': 'transparent',
        '--th-qr-code-foreground': 'var(--th-palette-gray-800)',

        /* === TO FIX: === */

        '--th-transactions-icon-type-expend-background-color': '#15d1aa',
        '--th-transactions-icon-type-income-background-color': '#9ab2d9',
        '--th-transactions-icon-type-exchange-background-color': '#10aca4',
        '--th-transactions-icon-type-failed-background-color': '#eb6d7a',

        '--scrollbar-thumb-background': '#c8ccce',

        '--warning-box-bg-shadow': '0 2px 40px 0 rgba(242, 242, 242, 0.5)',
        '--topbar-height': '64px',
      },

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
          backgroundColor: 'var(--scrollbar-thumb-background)',
          border: '7px solid transparent',
          borderRadius: '12px',
          backgroundClip: 'content-box',
        },
      },

      // ====== GLOBAL SCROLLBAR STYLE ======
      'html,body,#root,#root > [data-reactroot]': {
        width: '100%',
        height: '100%',
        '-webkit-font-smoothing': 'antialiased',
        ':global(.YoroiClassic)': {
          letterSpacing: '1px',
        },
      },
      body: {
        /* To remove background color for Chrome Inputs */
        'input:-webkit-autofill,input:-webkit-autofill:hover,input:-webkit-autofill:focus,input:-webkit-autofill:active': {
          WebkitBoxShadow: '0 0 0 30px rgba(255, 255, 255) inset !important',
        },
        '-webkit-font-smoothing': 'antialiased',
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

export { globalStyles };
