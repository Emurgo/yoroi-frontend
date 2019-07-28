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
  '--rp-input-bg-color': '#f3f3f5',
  '--rp-input-bg-color-disabled': 'rgba(207, 207, 207, 0.05)', // #cfcfcf
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
  '--tab-link-text-color': '#17D1AA',
  '--tab-link-text-size': '16px',
  '--tab-link-line-height': '19px',
  '--tab-link-border-color': '#17D1AA',
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

// Topbar gradient
const topbarGradient = {
  start: '#373f52',
  end: '#373f52',
};

export default {
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
  '--theme-scrollbar-thumb-background': '#c8ccce',

  '--theme-bordered-box-background-color': '#f3f3f5',
  '--theme-bordered-box-border': '1px solid #f3f3f5',
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
  '--theme-input-background-color': '#f3f3f5',

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
  '--theme-settings-pane-background-color': '#f3f3f5',
  '--theme-settings-pane-border': '1px solid #f3f3f5',
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

  '--theme-topbar-active-item-bottom-border': '5px solid #daa49a',
  '--theme-topbar-active-item-top-border': '5px solid transparent',
  '--theme-topbar-category-text-color': '#fafbfc',
  '--theme-topbar-background-color-gradient-start': topbarGradient.start,
  '--theme-topbar-background-color-gradient-end': topbarGradient.end,
  '--theme-topbar-background-color': `linear-gradient(to right, ${topbarGradient.start}, ${topbarGradient.end})`,
  '--theme-topbar-wallet-name-color': '#fafbfc',
  '--theme-topbar-wallet-info-color': '#fafbfc',
  '--theme-topbar-layout-body-background-color': '#ffffff',

  '--theme-transactions-list-background-color': '#f3f3f5',
  '--theme-transactions-list-border-color': '#f3f3f5',
  '--theme-transactions-list-group-date-color': '#121327',
  '--theme-transactions-list-item-details-color': '#121327',
  '--theme-transactions-state-failed-background-color': '#bdc5ce',
  '--theme-transactions-state-failed-text-color': '#bdc5ce',
  '--theme-transactions-state-pending-background-color': '#bdc5ce',
  '--theme-transactions-state-pending-stripes-color': '#b2bac2',
  '--theme-transactions-priority-color': 'rgba(18, 19, 39, 0.6)', // #121327
  '--theme-transactions-priority-low-background-color': '#e8abbb',
  '--theme-transactions-priority-medium-background-color': '#e7d5a3',
  '--theme-transactions-priority-heigh-background-color': '#afdac2',
  '--theme-transactions-icon-type-expend-background-color': '#54ca87',
  '--theme-transactions-icon-type-income-background-color': '#9ab2d9',
  '--theme-transactions-icon-type-exchange-background-color': '#10aca4',
  '--theme-transactions-icon-type-failed-background-color': '#eb6d7a',
  '--theme-transactions-sent-color': '#4a4a4a',
  '--theme-transactions-received-color': '#54ca87',

  '--theme-ada-redemption-headline-color': '#121327',
  '--theme-ada-redemption-instructions-color': '#121327',
  '--theme-ada-redemption-success-overlay-background-color': 'rgba(218, 164, 154, 0.88)',
  '--theme-ada-redemption-success-overlay-border-color': '#fafbfc',
  '--theme-ada-redemption-success-overlay-message-color': '#fafbfc',
  '--theme-ada-redemption-success-overlay-button-text-color': '#fafbfc',
  '--theme-ada-redemption-success-overlay-button-text-color-hover': '#daa49a',
  '--theme-ada-redemption-success-overlay-button-background-color-hover': '#fafbfc',
  '--theme-ada-redemption-disclaimer-background-color': 'rgba(171, 23, 0, 0.94)',
  '--theme-ada-redemption-disclaimer-text-color': '#fafbfc',
  '--theme-ada-redemption-disclaimer-button-background-color': '#ab1700',
  '--theme-ada-redemption-disclaimer-button-text-color': '#fafbfc',
  '--theme-ada-redemption-disclaimer-button-background-color-hover': '#fafbfc',
  '--theme-ada-redemption-disclaimer-button-text-color-hover': '#ab1700',
  '--theme-ada-redemption-disclaimer-checkbox-color-check': '#fafbfc',
  '--theme-ada-redemption-disclaimer-checkbox-color-checked': '#fafbfc',
  '--theme-ada-redemption-disclaimer-checkbox-color-after': '#ab1700',
  '--theme-ada-redemption-disclaimer-checkbox-label-color': '#fafbfc',
  '--theme-ada-redemption-disclaimer-button-border-color': '#fafbfc',
  '--theme-ada-redemption-no-wallets-instructions-color': '#121327',

  '--theme-icon-nav-color': 'rgba(18, 19, 39, 0.6)', // #121327
  '--theme-icon-nav-color-active': '#ffffff',
  '--theme-icon-topbar-color': '#fafbfc',
  '--theme-icon-toggle-menu-color': '#fafbfc',
  '--theme-icon-ada-summary-wallet-pending-confirmation-symbol-color': '#121327',
  '--theme-icon-ada-redemption-attention-color': '#fafbfc',
  '--theme-icon-ada-redemption-success-color': '#fafbfc',
  '--theme-icon-ada-redemption-certificate-color': '#9eabbb',
  '--theme-icon-ada-redemption-no-wallets': '#121327',
  '--theme-icon-copy-address-color': '#121327',
  '--theme-icon-back-button-color': '#121327',
  '--theme-icon-close-button-color': '#121327',
  '--theme-icon-transactions-ada-symbol-color': '#121327',
  '--theme-icon-transaction-type-color': '#fafbfc',

  '--theme-wallet-add-title-color': '#141415',
  '--theme-wallet-add-sub-title-color': '#888893',
  '--theme-wallet-add-option-dialog-item-title-color': '#2B2C32',
  '--theme-wallet-add-option-dialog-item-learn-more-block-bg-color': '#F5F7F9',
  '--theme-wallet-add-option-dialog-item-learn-more-button-color': '#ADAEB6',
  '--theme-wallet-add-option-dialog-item-learn-more-button-bg-color': '#F5F7F9',
  '--theme-backup-mnemonic-background-color': '#f3f3f5',

  '--theme-instructions-text-color': '#121327',

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

  '--theme-wallet-navigation-tab-height': '40px',

  '--theme-warning-box-bg-color': 'rgba(233, 72, 61, 0.06)', // #E9483D

  '--theme-warning-color': `#E9483D`,
};
