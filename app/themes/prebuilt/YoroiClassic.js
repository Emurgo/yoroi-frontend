// @flow
//  ==== Theme: Yoroi Classic === //

import common from './Common';

// FONTS
const rpFonts = {
  '--rp-theme-font-thin': 'SFUIDisplay-Thin',
  '--rp-theme-font-light': 'SFUIDisplay-Light',
  '--rp-theme-font-medium': 'SFUIDisplay-Medium',
  '--rp-theme-font-regular': 'SFUIDisplay-Regular',
  '--rp-theme-font-bold': 'SFUIDisplay-Bold',
};

// AUTOCOMPLETE
const rpAutocomplete = {
  '--rp-autocomplete-bg-color': '#f3f3f5',
  '--rp-autocomplete-border': '1px solid #c6cdd6',
  '--rp-autocomplete-border-color-opened': '#121327',
  '--rp-autocomplete-input-text-color': '#121327',
  '--rp-autocomplete-placeholder-color': 'rgba(94, 96, 102, 0.5)', // #5E6066
  '--rp-autocomplete-selected-word-box-bg-color': 'rgba(218, 164, 154, 1)', // #DAA49A
  '--rp-autocomplete-selected-word-text-color': '#fafbfc',
};

// BUBBLE
const rpBubble = {
  '--rp-bubble-bg-color': '#f3f3f5',
  '--rp-bubble-border-color': '#c6cdd6',
  '--rp-bubble-border-radius': '2px',
  // arrows are actually used by tooltips
  '--rp-bubble-arrow-width': '14px',
  '--rp-bubble-arrow-height': '4px',
};

// BUTTON
const rpButton = {
  '--rp-button-bg-color': '#daa49a',
  '--rp-button-bg-color-active': '#c4948b',
  '--rp-button-bg-color-disabled': 'rgba(218, 164, 154, 0.3)', // #DAA49A
  '--rp-button-bg-color-hover': '#edb3a8',
  '--rp-button-font-family': rpFonts['--rp-theme-font-medium'],
  '--rp-button-font-size': '14px',
  '--rp-button-line-height': '20px',
  '--rp-button-padding': '12px 20px',
  '--rp-button-text-color': '#fafbfc',
  '--rp-button-text-transform': 'none',
  '--rp-button-width': '400px',
};

// CHECKBOX
const rpCheckbox = {
  '--rp-checkbox-border': '1px solid #daa49a',
  '--rp-checkbox-border-color-disabled': 'rgba(218, 164, 154, 0.2)', // #DAA49A
  '--rp-checkbox-check-bg-color': '#daa49a',
  '--rp-checkbox-label-text-color': common['--cmn-default-color-grey'],
  '--rp-checkbox-label-text-color-disabled': 'rgba(18, 19, 39, 0.3)', // #121327
};

// COLORS
const rpColors = {
  '--rp-theme-color-error': '#ea4c5b',
};

// FORMFIELD
const rpFormfield = {
  '--rp-formfield-bg-color-disabled': 'none',
  '--rp-formfield-label-text-color': '#121327',
  '--rp-formfield-label-text-color-disabled': '#121327',
  '--rp-formfield-error-text-color': '#ea4c5b',
  '--rp-formfield-error-text-opacity': '0.75',
};

// INPUT
const rpInput = {
  '--rp-input-bg-color': 'transparent',
  '--rp-input-bg-color-disabled': 'transparent',
  '--rp-input-border-color': '#c6cdd6',
  '--rp-input-border-color-disabled': 'rgba(207, 207, 207, 0.05)', // #cfcfcf
  '--rp-input-border-color-errored': '#ea4c5b',
  '--rp-input-border-color-focus': '#121327',
  '--rp-input-line-height': '22px',
  '--rp-input-padding': '10px',
  '--rp-input-placeholder-color': 'rgba(94, 96, 102, 0.5)', // #5E6066
  '--rp-input-placeholder-color-disabled': 'rgba(94, 96, 102, 0.5)', // #5E6066
  '--rp-input-text-color': '#121327',
  '--rp-input-text-color-disabled': 'rgba(94, 96, 102, 0.5)', // #5E6066
  '--rp-input-font-family': rpFonts['--rp-theme-font-light'],
};

// MODAL
const rpModal = {
  '--rp-modal-bg-color': '#fafbfc',
  '--rp-modal-max-height': '90%',
  '--rp-modal-overlay-bg-color': 'rgba(11, 6, 6, 0.8)', // #0B0606
};

// OPTIONS
const rpOptions = {
  '--rp-option-bg-color': '#fafbfc',
  '--rp-option-bg-color-highlighted': '#edeeef',
  '--rp-option-border-color': '#c6cdd6',
  '--rp-option-checkmark-color': '#121327',
  '--rp-option-line-height': '22px',
  '--rp-option-text-color': '#121327',
  '--rp-options-border-color': '#c6cdd6',
  '--rp-options-shadow': 'none',
};

// SELECT
const rpSelect = {
  '--rp-select-arrow-bg-color': '#c6cdd6',
  '--rp-select-arrow-bg-color-open': '#121327',
  '--rp-select-input-bg-color': '#fafbfc',
  '--rp-select-input-border-color': '#c6cdd6',
  '--rp-select-input-border-color-focus': '#121327',
  '--rp-select-input-text-color': '#121327',
};

// SWITCH
const rpSwitch = {
  '--rp-switch-bg-color-off': '#daa49a',
  '--rp-switch-bg-color-on': '#daa49a',
  '--rp-switch-label-margin': '0 30px 0 0',
  '--rp-switch-label-opacity': '0.5',
  '--rp-switch-label-text-color': '#c6cdd6',
  '--rp-switch-label-width': '100%',
  '--rp-switch-opacity-off': '0.3',
  '--rp-switch-root-margin': '0 0 30px 0',
  '--rp-switch-thumb-bg-color': '#fff',
};

// TEXTAREA
const rpTextArea = {
  '--rp-textarea-bg-color': '#fafbfc',
  '--rp-textarea-bg-color-disabled': 'rgba(94, 96, 102, 0.05)', // #5E6066
  '--rp-textarea-border': '1px solid #c6cdd6',
  '--rp-textarea-border-color-disabled': 'rgba(94, 96, 102, 0.05)', // #5E6066
  '--rp-textarea-border-color-errored': '#ea4c5b',
  '--rp-textarea-border-color-focus': '#121327',
  '--rp-textarea-border-radius': '2px',
  '--rp-textarea-line-height': '20px',
  '--rp-textarea-placeholder-color': 'rgba(94, 96, 102, 0.5)', // #5E6066
  '--rp-textarea-resize': 'none',
  '--rp-textarea-text-color': '#121327',
};

// TABS
const tabs = {
  '--tab-link-text-color': '#DAA49A',
  '--tab-link-text-size': '16px',
  '--tab-link-line-height': '19px',
  '--tab-link-border-color': '#DAA49A',
};

// OPTION CARD
const itemCard = {
  '--card-bg-color': '#fff',
  '--card-border-radius': '8px',
  '--card-text-color': '#2b2c32',
  '--card-text-color-hover': '#DAA49A',
  '--card-text-size': '16px',
  '--card-width': '250px',
  '--card-height': '380px',
};

const rpYoroiTheme = {
  ...rpAutocomplete,
  ...rpBubble,
  ...rpButton,
  ...rpCheckbox,
  ...rpColors,
  ...rpFonts,
  ...rpFormfield,
  ...rpInput,
  ...rpModal,
  ...rpOptions,
  ...rpSelect,
  ...rpSwitch,
  ...rpTextArea,
  ...tabs,
  ...itemCard,
};

// Sidebar gradient
const sidebarGradient = {
  start: '#373f52',
  end: '#373f52',
};

const YoroiClassic = {
  // COMMON-THEME-INDEPENDENT
  ...common,

  // REACT-POLYMORPH
  ...rpYoroiTheme,

  // FONTS
  '--preferred-font': '"Times New Roman", serif',

  '--font-ultralight': 'SFUIDisplay-Ultralight',
  '--font-thin': 'SFUIDisplay-Thin',
  '--font-light': 'SFUIDisplay-Light',
  '--font-regular': 'SFUIDisplay-Regular',
  '--font-medium': 'SFUIDisplay-Medium',
  '--font-semibold': 'SFUIDisplay-Semibold',
  '--font-bold': 'SFUIDisplay-Bold',
  '--font-heavy': 'SFUIDisplay-Heavy',
  '--font-black': 'SFUIDisplay-Black',

  '--font-mono-thin': 'RobotoMono-Thin',
  '--font-mono-light': 'RobotoMono-Light',
  '--font-mono-regular': 'RobotoMono-Regular',
  '--font-mono-medium': 'RobotoMono-Medium',
  '--font-mono-bold': 'RobotoMono-Bold',

  '--theme-input-hint-font': 'SFUIDisplay-Regular',

  // COLORS
  '--theme-border-gray': '#DEE2EA',
  '--theme-scrollbar-thumb-background': '#c8ccce',

  '--theme-bordered-box-background-color': '#ffffff',
  '--theme-bordered-box-border': '0px solid #ffffff',
  '--theme-bordered-box-text-color': '#121327',

  '--theme-bullet-point-color': '#adaeb5',

  '--theme-button-primary-background-color': '#daa49a',
  '--theme-button-primary-background-color-hover': '#edb3a8',
  '--theme-button-primary-background-color-active': '#c4948b',
  '--theme-button-primary-background-color-disabled': 'rgba(218, 164, 154, 0.3)', // #DAA49A
  '--theme-button-primary-text-color-disabled': '#fafbfc',
  '--theme-button-primary-text-color': '#fafbfc',

  '--theme-button-flat-background-color': 'rgba(218, 164, 154, 0.1)', // #DAA49A
  '--theme-button-flat-background-color-hover': 'rgba(242, 183, 172, 0.1)', // #F2B7AC
  '--theme-button-flat-background-color-active': 'rgba(191, 144, 136, 0.1)', // #BF9088
  '--theme-button-flat-background-color-disabled': 'rgba(240, 243, 245, 0.3)', // #F0F3F5
  '--theme-button-flat-text-color-disabled': '#121327',
  '--theme-button-flat-text-color': '#121327',

  '--theme-choice-tabs-text-color': '#121327',
  '--theme-choice-tabs-text-color-active': '#121327',
  '--theme-choice-tabs-bottom-border-color-active': '#121327',

  '--theme-dialog-choice-tabs-text-color': '#121327',
  '--theme-dialog-choice-tabs-text-color-active': '#121327',
  '--theme-dialog-choice-tabs-bottom-border-color-active': '#121327',
  '--theme-dialog-big-button-background-color': '#f3f3f5',
  '--theme-dialog-big-button-border-color': '#f3f3f5',
  '--theme-dialog-big-button-label-color': '#121327',
  '--theme-dialog-big-button-description-color': '#121327',
  '--theme-dialog-title-color': '#121327',
  '--theme-dialog-title-margin': '0 0 20px 0',
  '--theme-dialog-input-margin': '10px 0 20px',
  '--theme-dialog-input-actions-margin': '20px 0 0 0',

  '--theme-input-border-color': '#c6cdd6',
  '--theme-input-text-color': '#121327',
  '--theme-input-right-floating-text-color': 'rgba(94, 96, 102, 0.5)',
  '--theme-input-remove-color-light': '#ea4c5b',
  '--theme-input-background-color': 'transparent',

  '--theme-main-body-background-color': '#ffffff',
  '--theme-main-body-messages-color': '#121327',

  '--theme-nav-item-background-color': '#f3f3f5',
  '--theme-nav-item-background-color-hover': '#f9f9fa',
  '--theme-nav-item-background-color-active': '#fff',
  '--theme-nav-item-text-color': 'rgba(18, 19, 39, 0.6)', // #121327
  '--theme-nav-item-text-color-active': '#121327',

  '--theme-notification-message-background-color': 'rgba(218, 164, 154, 0.8)', // #DAA49A
  '--theme-notification-message-text-color': '#fafbfc',

  '--theme-receive-qr-code-background-color': 'transparent',
  '--theme-receive-qr-code-foreground-color': '#121327',

  '--theme-send-confirmation-dialog-send-values-color': '#ea4c5b',
  '--theme-hw-send-confirmation-info-block-background-color': '#f3f3f5',

  '--theme-settings-body-background-color': '#ffffff',
  '--theme-settings-pane-background-color': '#ffffff',
  '--theme-settings-pane-border': '1px solid #ffffff',
  '--theme-settings-menu-box-background-color': '#f3f3f5',
  '--theme-settings-menu-box-border': '1px solid #f3f3f5',
  '--theme-settings-menu-item-text-color': '#121327',
  '--theme-settings-menu-item-text-color-active': '#121327',
  '--theme-settings-menu-item-text-color-enabled-hover': '#121327',
  '--theme-settings-menu-item-text-color-disabled': '#b3b3b3',
  '--theme-settings-menu-item-background-color-active': '#ffffff',
  '--theme-settings-menu-item-left-border-color-active': '#daa49a',
  '--theme-settings-theme-select-title-color': '#121327',

  '--theme-system-error-overlay-attention-icon-color': '#fafbfc',
  '--theme-system-error-overlay-background-color': 'rgba(171, 23, 0, 0.94)', // #AB1700
  '--theme-system-error-overlay-button-background-color': '#ab1700',
  '--theme-system-error-overlay-button-background-color-hover': '#fafbfc',
  '--theme-system-error-overlay-button-border-color': '#fafbfc',
  '--theme-system-error-overlay-button-text-color': '#fafbfc',
  '--theme-system-error-overlay-button-text-color-hover': '#ab1700',
  '--theme-system-error-overlay-text-color': '#fafbfc',

  '--theme-topbar-background-color-gradient-start': sidebarGradient.start,
  '--theme-topbar-background-color-gradient-end': sidebarGradient.end,
  '--theme-topbar-background-color': `linear-gradient(to right, ${sidebarGradient.start}, ${sidebarGradient.end})`,
  '--theme-topbar-wallet-name-color': '#fafbfc',
  '--theme-topbar-wallet-info-color': '#fafbfc',
  '--theme-topbar-layout-body-background-color': '#ffffff',

  '--theme-transactions-list-text-color': '#242838',
  '--theme-transactions-list-background-color': '#f3f3f5',
  '--theme-transactions-list-border-color': '#f0f3f5',
  '--theme-transactions-list-group-date-color': '#2b2c32',
  '--theme-transactions-list-pending-text-color': '#C4CAD7',
  '--theme-transactions-list-detail-background-color': '#FAFAFC',
  '--theme-transactions-list-detail-row-text-color': '#6B7384',
  '--theme-transactions-state-failed-background-color': 'rgba(255, 19, 81, 0.5)', // #ff1351
  '--theme-transactions-state-failed-text-color': '#E8003D',
  '--theme-transactions-state-pending-background-color': '#F0F3F5',
  '--theme-transactions-state-pending-stripes-color': 'rgba(217, 221, 224, 0.2)', // #D9DDE0
  '--theme-transactions-state-pending-text-color': '#ADAEB6',
  '--theme-transactions-priority-low-background-color': 'rgba(255, 19, 81, 0.15)', // #ff1351
  '--theme-transactions-priority-low-text-color': '#FA5F88',
  '--theme-transactions-priority-medium-background-color': 'rgba(245, 166, 35, 0.3)', // F5A623
  '--theme-transactions-priority-medium-text-color': '#F5A623',
  '--theme-transactions-priority-high-background-color': '#C9EDE5',
  '--theme-transactions-priority-high-text-color': '#17D1AA',
  '--theme-transactions-icon-type-expend-background-color': '#15d1aa',
  '--theme-transactions-icon-type-income-background-color': '#9ab2d9',
  '--theme-transactions-icon-type-exchange-background-color': '#10aca4',
  '--theme-transactions-icon-type-failed-background-color': '#eb6d7a',
  '--theme-transactions-amount-color': '#3154CB',

  '--theme-icon-nav-color': 'rgba(18, 19, 39, 0.6)', // #121327
  '--theme-icon-nav-color-active': '#ffffff',
  '--theme-icon-topbar-color': '#fafbfc',
  '--theme-icon-toggle-menu-color': '#fafbfc',
  '--theme-icon-ada-summary-wallet-pending-confirmation-symbol-color': '#121327',
  '--theme-icon-copy-address-color': '#121327',
  '--theme-icon-copy-address-button-background-color': '#D9DDE0',
  '--theme-icon-back-button-color': '#121327',
  '--theme-icon-close-button-color': '#121327',
  '--theme-icon-transactions-ada-symbol-color': '#353535',
  '--theme-icon-transactions-ada-symbol-pending-color': '#D9DAE0',
  '--theme-icon-transaction-type-color': '#fafbfc',

  '--theme-wallet-add-title-color': '#141415',
  '--theme-wallet-add-sub-title-color': '#888893',
  '--theme-wallet-add-option-dialog-item-title-color': '#2B2C32',
  '--theme-wallet-add-option-dialog-item-learn-more-block-bg-color': '#F5F7F9',
  '--theme-wallet-add-option-dialog-item-learn-more-button-color': '#ADAEB6',
  '--theme-wallet-add-option-dialog-item-learn-more-button-bg-color': '#F5F7F9',
  '--theme-backup-mnemonic-background-color': '#f3f3f5',

  '--theme-instructions-text-color': '#121327',

  '--theme-maintenance-background-color': '#050D23',
  '--theme-maintenance-border-color': '#D9DDE0',

  '--theme-label-button-color': '#121327',

  '--theme-loading-background-color': '#fafbfc',

  '--theme-mnemonic-background-color': 'rgba(218, 164, 154, 0.12)', // #DAA49A
  '--theme-mnemonic-background-color-hover': 'rgba(242, 183, 172, 0.12)', // #F2B7AC

  '--theme-separation-border-color': '#dfe4e8',

  '--theme-support-settings-text-color': '#121327',
  '--theme-support-settings-link-color': '#121327',

  '--theme-terms-of-use-text-color': '#121327',

  '--theme-wallet-password-switch-label-color': '#121327',

  '--theme-banner-warning-background-color': '#b54b4b',
  '--theme-hw-connect-dialog-middle-block-common-background-color': '#f3f3f5',
  '--theme-hw-connect-dialog-middle-block-common-error-background-color': '#fdf1f0',

  '--theme-widgets-progress-step-common-color': '#daa49a',
  '--theme-underline-light-color': '#adaeB6',
  '--theme-underline-dark-color': '#464749',
  '--theme-widgets-hash-dark-color': '#000000',
  '--theme-widgets-hash-light-color': '#929293',

  '--theme-link-button-background-color-hover': '#D9DDE0',
  '--theme-link-button-text-color': '#000',

  '--theme-export-transactions-to-file': '#f9f9fa',

  '--theme-default-main-color': '#DAA49A',
  '--theme-default-main-bg': '#F3F3F5',

  '--theme-default-color-red': '#FF1351',
  '--theme-default-color-red-medium': 'rgba(255, 19, 81, 0.3)',
  '--theme-default-color-red-light': 'rgba(255, 19, 81, 0.6)',

  '--theme-wallet-nowallet-text-color': '#2B2C32',

  '--theme-wallet-navigation-tab-height': '40px',
  '--theme-wallet-navigation-tab-text-color': '#6B7384',
  '--theme-wallet-navigation-tab-text-color-active': '#DAA49A',
  '--theme-wallet-navigation-tab-text-color-hover': '#17D1AA',
  '--theme-wallet-navigation-tab-text-color-disabled': '#C4CAD7',


  '--theme-warning-box-bg-color': 'rgba(233, 72, 61, 0.06)', // #E9483D

  '--theme-warning-color': `#E9483D`,
  '--theme-warning-button-color': `#CC3F35`,
  '--theme-warning-button-color-active': `#CC3F35`,
  '--theme-warning-button-color-hover': `#FF4F42`,
  '--theme-warning-button-color-disabled': `rgba(204, 63, 53, 0.35)`, // CC3F35

  '--theme-tooltipbox-border-color': 'rgba(77,32,192,0.08)', // 4d20c0

  // Sidebar
  '--theme-sidebar-background-color': `linear-gradient(22.58deg, ${sidebarGradient.start} 0%, ${sidebarGradient.end} 100%)`,
  '--theme-sidebar-text-left-spacing': '16px',
  '--theme-sidebar-text-color': '#FFFFFF',
  '--theme-sidebar-text-font-size': '14px',
  '--theme-sidebar-text-line-height': '22px',
  '--theme-sidebar-icon-color': '#FFFFFF',
  '--theme-sidebar-icon-color-hover': '#DAA49A',
  '--theme-sidebar-icon-color-active': '#DAA49A',
  '--theme-sidebar-item-background-color-hover': `${sidebarGradient.end}`,

  // Page

  '--theme-page-container-width': '1295px',
  '--theme-page-container-side-padding': '40px',
  '--theme-page-background-color': '#F0F3F5',
  '--theme-page-content-background-color': '#FFFFFF',
  '--theme-page-content-box-shadow': '0 2px 12px 0 rgba(0, 0, 0, 0.06)',
  '--theme-page-content-border-radius': '8px',
  '--theme-page-content-box-bottom': '24px',
  '--theme-banner-height': '46px',
  '--theme-wallet-dropdown-main-text-color': '#242838',
  '--theme-wallet-dropdown-secondary-text-color': '#6B7384',
  '--theme-wallet-dropdown-accent-text-color': '#DAA49A',
  '--theme-wallet-dropdown-box-shadow': '0 10px 12px 0 rgba(0, 0, 0, 0.16)',
  '--theme-wallet-dropdown-background-color': '#FFFFFF',
  '--theme-wallet-dropdown-selected-background-color': '#F0F3F5',
  '--theme-wallet-dropdown-row-border-color': '#E0E3EB',
  '--theme-wallet-dropdown-border-radius': '8px',
  '--theme-wallet-dropdown-min-width': '700px',
  '--theme-wallet-plate-main-text-color': '#242838',
  '--theme-wallet-plate-secondary-text-color': '#6B7384',
  '--theme-wallet-receive-submit-button-background-color': '#DAA49A',
  '--theme-wallet-receive-hash-text-color': '#242838',
  '--theme-wallet-receive-hash-used-text-color': '#6B7384',
  '--theme-wallet-receive-wallet-hash-text-color': '#353535',
  '--theme-wallet-receive-label-text-color': '#2B2C32',

  // Navbar

  '--theme-navbar-height': '60px',
  '--theme-navbar-background-color': '#F0F3F5',
  '--theme-navbar-color': '#6B7384',
};

export const getThemeVars: ('shelley' | void) => {...} = (_env) => {
  return YoroiClassic;
};
