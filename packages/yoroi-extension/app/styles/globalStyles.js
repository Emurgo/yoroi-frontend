/* eslint-disable no-nested-ternary */
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
        '--th-palette-tx-status-pending-stripes': theme.palette.txStatus.pending.text,
        '--th-palette-tx-status-high-background': theme.palette.txStatus.high.background,
        '--th-palette-tx-status-high-text': theme.palette.txStatus.high.text,
        '--th-palette-tx-status-failed-background': theme.palette.txStatus.failed.background,
        '--th-palette-tx-status-failed-text': theme.palette.txStatus.failed.text,
        '--th-palette-tx-status-medium-background': theme.palette.txStatus.medium.background,
        '--th-palette-tx-status-medium-text': theme.palette.txStatus.medium.text,
        '--th-palette-tx-status-low-background': theme.palette.txStatus.low.background,
        '--th-palette-tx-status-low-text': theme.palette.txStatus.low.text,

        '--th-palette-background-banner-warning': theme.palette.background.banner.warning,
        '--th-palette-background-walletAdd-title': theme.palette.background.walletAdd.title,
        '--th-palette-background-walletAdd-subtitle': theme.palette.background.walletAdd.subtitle,

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
        '--component-dialog-min-width-md': '540px',
        '--component-dialog-min-width-lg': '600px',

        '--th-sidebar-text': theme.palette.background.sidebar.text,
        '--th-sidebar-background': `linear-gradient(22.58deg, ${theme.palette.background.sidebar.start} 0%, ${theme.palette.background.sidebar.end} 100%)`,
        '--th-sidebar-end': theme.palette.background.sidebar.end,

        '--th-notification-message-background': 'rgba(21, 209, 170, 0.8)',

        /* === QR CODE === */
        '--th-qr-code-background': 'transparent',
        '--th-qr-code-foreground': 'var(--th-palette-gray-800)',

        /* === TODO: FIX AND UNIFY ALL CSS VARIABLES === */
        '--th-transactions-icon-type-expend-background-color': '#15d1aa',
        '--th-transactions-icon-type-income-background-color': '#9ab2d9',
        '--th-transactions-icon-type-exchange-background-color': '#10aca4',
        '--th-transactions-icon-type-failed-background-color': '#eb6d7a',
        '--scrollbar-thumb-background': '#c8ccce',
        '--warning-box-bg-shadow': '0 2px 40px 0 rgba(242, 242, 242, 0.5)',
        '--topbar-height': '64px',
        '--th-navigation-tab-height': theme.name === 'classic' ? '45px' : '64px',
        '--th-widgets-hash-dark': theme.name === 'classic' ? '#000000' : '#464749',
        '--th-widgets-hash-light': theme.name === 'classic' ? '#929293' : '#adaeb6',
        '--theme-send-confirmation-dialog-send-values-color':
          theme.name === 'classic' ? '#ea4c5b' : '#15d1aa',
        '--theme-wallet-add-option-dialog-item-title-color': 'var(--th-palette-gray-900)',
        '--theme-wallet-add-option-dialog-item-learn-more-button-bg-color': '#F5F7F9',

        '--theme-hw-connect-dialog-middle-block-common-background-color':
          theme.name === 'classic' ? '#f3f3f5' : '#ffffff',
        '--theme-hw-connect-dialog-middle-block-common-error-background-color':
          theme.name === 'classic' ? '#fdf1f0' : '#ffffff',

        '--theme-terms-of-use-text-color': theme.name === 'classic' ? '#121327' : '#38293d',
        '--theme-loading-background-color': '#fafbfc',

        '--theme-support-settings-text': theme.name === 'classic' ? '#121327' : '#2b2c32',
        '--theme-instructions-text-color': theme.name === 'classic' ? '#121327' : '#adaeb6',
        '--theme-mnemonic-background-color-hover':
          theme.name === 'classic' ? 'rgba(242, 183, 172, 0.12)' : '#f0f3f5',
        '--theme-mnemonic-background-color':
          theme.name === 'classic' ? 'rgba(218, 164, 154, 0.12)' : '#f0f3f5',

        ...(theme.name === 'classic'
          ? {
              '--theme-backup-mnemonic-background-color': '#f3f3f5',
            }
          : theme.name === 'modern'
          ? {
              '--theme-instructions-recovery-text-color': '#2b2c32',
              '--theme-mnemonic-border-color': '#9b9b9b',
              '--theme-mnemonic-border-filled-color': '#4a4a4a',
              '--theme-mnemonic-button-text-color': '#353535',
              '--theme-default-color-blue': '#2249BE',
              // Dashboard
              '--theme-dashboard-label-underline-color': 'rgba(135, 145, 173, 0.8)',
              '--theme-dashboard-card-shadow-color': 'rgba(24, 26, 30, 0.08)',
              '--theme-dashboard-card-border-color': 'rgba(77, 32, 192, 0.08)',
              '--theme-dashboard-card-vertical-separator-color': '#E6E6E6',
              '--theme-dashboard-card-nodelegation-background-color': '#F9FBFF',
              '--theme-dashboard-tooltip-background-color': 'rgba(56, 57, 61, 0.75)',
              '--theme-dashboard-stakepool-head-background-color': '#F4F6FC',
              '--theme-dashboard-epoch-time-background': '#F0F3F5',
              '--theme-dashboard-percentage-epoch-base': '#B7C3ED',
              '--theme-dashboard-percentage-epoch-circle': '#3154CB',
              '--theme-dashboard-percentage-stake-base': '#FFEDF2',
              '--theme-dashboard-percentage-stake-circle': '#FF1755',
              '--theme-dashboard-graph-tab-color': '#ADAEB6',
              '--theme-dashboard-graph-active-tab-color': '#3D60CD',
              '--theme-dashboard-graph-radio-color': '#93979C',
              '--theme-dashboard-graph-active-radio-color': '#17D1AA',
              '--theme-dashboard-graph-axis-tick-color': '#ADAEB6',
              '--theme-dashboard-graph-axis-text-color': '#38393D',
              '--theme-dashboard-graph-bar-hover-background-color': '#D9DDE0',
              '--theme-dashboard-graph-bar-primary-color': '#6D80FF',
              '--theme-dashboard-graph-bar-secondary-color': '#1A44B7',
              '--theme-dashboard-graph-bar-width': 16,
              '--theme-dashboard-graph-tooltip-text-color': '#FFFFFF',
              '--theme-dashboard-graph-tooltip-background': 'rgba(56, 57, 61, 0.7)',

              // My Wallets page
              '--theme-mywallets-expandable-background-color': '#FAFAFC',
              '--theme-mywallets-ada-amount-decimal-color': 'rgba(36, 40, 56, 0.5)',
              '--theme-mywallets-tooltip-background-color': 'rgba(56, 57, 61, 0.7)',
            }
          : null),
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
