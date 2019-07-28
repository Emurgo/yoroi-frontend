// @flow
//  ==== Theme: Yoroi Modern === //

import common from './Common';

// FONTS
const rpFonts = {
  '--rp-theme-font-thin': 'Rubik-Light',
  '--rp-theme-font-light': 'Rubik-Light',
  '--rp-theme-font-medium': 'Rubik-Medium',
  '--rp-theme-font-regular': 'Rubik-Regular',
  '--rp-theme-font-bold': 'Rubik-Bold',
};

// AUTOCOMPLETE
const rpAutocomplete = {
  '--rp-autocomplete-bg-color': 'transparent',
  '--rp-autocomplete-border': '1px solid #9b9b9b',
  '--rp-autocomplete-border-color-opened': '#353535',
  '--rp-autocomplete-input-text-color': '#353535',
  '--rp-autocomplete-placeholder-color': 'rgba(94, 96, 102, 0.5)', // #5E6066
  '--rp-autocomplete-selected-word-box-bg-color': '#f0f3f5',
  '--rp-autocomplete-selected-word-box-bg-color-secondary': '#D9DDE0',
  '--rp-autocomplete-selected-word-text-color': '#353535',
};

// BUBBLE
const rpBubble = {
  '--rp-bubble-bg-color': '#fff',
  '--rp-bubble-border-color': '#fff',
  '--rp-bubble-border-radius': '8px',
  // arrows are actually used by tooltips
  '--rp-bubble-arrow-width': '14px',
  '--rp-bubble-arrow-height': '4px',
};

// BUTTON
const rpButton = {
  '--rp-button-bg-color': '#17d1aa',
  '--rp-button-bg-color-active': '#12b190',
  '--rp-button-bg-color-disabled': 'rgba(23, 209, 170, 0.3)', // #17d1aa
  '--rp-button-bg-color-hover': '#17e2b8',
  '--rp-button-font-family': rpFonts['--rp-theme-font-medium'],
  '--rp-button-font-size': '14px',
  '--rp-button-line-height': '20px',
  '--rp-button-padding': '12px 20px',
  '--rp-button-text-color': '#fff',
  '--rp-button-text-transform': 'none',
};

// CHECKBOX
const rpCheckbox = {
  '--rp-checkbox-border': '2px solid #353535',
  '--rp-checkbox-border-color-disabled': 'rgba(21, 209, 170, 0.2)', // #15d1aa
  '--rp-checkbox-check-bg-color': '#15d1aa',
  '--rp-checkbox-label-text-color': common['--cmn-default-color-grey'],
  '--rp-checkbox-label-text-color-disabled': 'rgba(53, 53, 53, 0.3)', // #353535
};

// COLORS
const rpColors = {
  '--rp-theme-color-error': '#ff1351',
};

// FORMFIELD
const rpFormfield = {
  '--rp-formfield-bg-color-disabled': 'none',
  '--rp-formfield-label-text-color': '#353535',
  '--rp-formfield-label-text-color-disabled': 'rgba(53, 53, 53, 0.5)', // '#353535
  '--rp-formfield-error-text-color': '#ff1351',
  '--rp-formfield-error-text-opacity': '1',
};

// INPUT
const rpInput = {
  '--rp-input-bg-color': 'transparent',
  '--rp-input-bg-color-disabled': 'transparent',
  '--rp-input-border-color': '#9b9b9b',
  '--rp-input-border-color-disabled': 'rgba(155, 155, 155, 0.5)', // #9b9b9b
  '--rp-input-border-color-errored': '#ff1351',
  '--rp-input-border-color-focus': '#4a4a4a',
  '--rp-input-placeholder-color': 'rgba(94, 96, 102, 0.5)', // #5E6066
  '--rp-input-placeholder-color-disabled': 'rgba(94, 96, 102, 0.5)', // #5E6066
  '--rp-input-text-color': '#353535',
  '--rp-input-text-color-disabled': 'rgba(94, 96, 102, 0.5)', // #5E6066
  '--rp-input-font-family': rpFonts['--rp-theme-font-regular'],
};

// MODAL
const rpModal = {
  '--rp-modal-bg-color': '#fff',
  '--rp-modal-max-height': '97%',
  '--rp-modal-overlay-bg-color': 'rgba(6, 13, 36, 0.8)', // #060D24
};

// OPTIONS
const rpOptions = {
  '--rp-option-bg-color': '#fff',
  '--rp-option-bg-color-highlighted': '#edeeef',
  '--rp-option-border-color': '#c6cdd6',
  '--rp-option-checkmark-color': '#353535',
  '--rp-option-line-height': '22px',
  '--rp-option-text-color': '#353535',
  '--rp-options-border-color': '#c6cdd6',
  '--rp-options-shadow': 'none',
};

// SELECT
const rpSelect = {
  '--rp-select-arrow-bg-color': '#9b9b9b',
  '--rp-select-arrow-bg-color-open': '#353535',
  '--rp-select-input-bg-color': '#fafbfc',
  '--rp-select-input-border-color': '#9b9b9b',
  '--rp-select-input-border-color-focus': '#4a4a4a',
  '--rp-select-input-text-color': '#353535',
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
  '--rp-textarea-bg-color': 'transparent',
  '--rp-textarea-bg-color-disabled': 'transparent',
  '--rp-textarea-border': '1px solid #9b9b9b',
  '--rp-textarea-border-color-disabled': 'rgba(155, 155, 155, 1)', // #9b9b9b
  '--rp-textarea-border-color-errored': '#ff1351',
  '--rp-textarea-border-color-focus': '#4a4a4a',
  '--rp-textarea-border-radius': '8px',
  '--rp-textarea-line-height': '20px',
  '--rp-textarea-placeholder-color': 'rgba(94, 96, 102, 0.5)', // #5E6066
  '--rp-textarea-resize': 'none',
  '--rp-textarea-text-color': '#353535',
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
  '--card-text-color': '#38393d',
  '--card-text-color-hover': '#2249BE',
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
  start: '#1e46bd',
  end: '#4760ff',
};

// Modal Margin
const modalMargin = {
  top: 24,
  right: 40,
  bottom: 40,
  left: 40,
};

export default {
  // COMMON-THEME-INDEPENDENT
  ...common,

  // REACT-POLYMORPH
  ...rpYoroiTheme,

  // FONTS
  '--preferred-font': '"Times New Roman", serif',

  '--font-ultralight': 'Rubik-Light',
  '--font-thin': 'Rubik-Light',
  '--font-light': 'Rubik-Light',
  '--font-regular': 'Rubik-Regular',
  '--font-medium': 'Rubik-Medium',
  '--font-semibold': 'Rubik-Medium',
  '--font-bold': 'Rubik-Bold',
  '--font-heavy': 'Rubik-Bold',
  '--font-black': 'Rubik-Black',

  '--font-mono-thin': 'RobotoMono-Thin',
  '--font-mono-light': 'RobotoMono-Light',
  '--font-mono-regular': 'RobotoMono-Regular',
  '--font-mono-medium': 'RobotoMono-Medium',
  '--font-mono-bold': 'RobotoMono-Bold',

  '--theme-input-hint-font': 'Rubik-Regular',

  // COLORS
  '--theme-scrollbar-thumb-background': '#c8ccce',

  '--theme-bordered-box-background-color': '#f0f3f5',
  '--theme-bordered-box-border': '1px solid #f0f3f5',
  '--theme-bordered-box-text-color': '#2b2c32',

  '--theme-bullet-point-color': '#adaeb5',

  '--theme-button-primary-background-color': '#17d1aa',
  '--theme-button-primary-background-color-hover': '#17e2b8',
  '--theme-button-primary-background-color-active': '#12b190',
  '--theme-button-primary-background-color-disabled': '#c9ede5',
  '--theme-button-primary-text-color-disabled': '#ffffff',
  '--theme-button-primary-text-color': '#ffffff',

  '--theme-button-outlined-background-color': '#15d1aa',
  '--theme-button-outlined-background-color-hover': 'rgba(23, 226, 184, 0.1)',
  '--theme-button-outlined-border-color-hover': 'rgb(23, 226, 184)',
  '--theme-button-outlined-background-color-active': '#12b190',
  '--theme-button-outlined-background-color-disabled': '#c9ede5',
  '--theme-button-outlined-text-color-disabled': '#c9ede5',
  '--theme-button-outlined-text-color': '#15d1aa',
  '--theme-button-outlined-active-text-color': '#ffffff',

  '--theme-checkbox-label-color': '#353535',
  '--theme-checkbox-border-color': '#353535',
  '--theme-checkbox-background-color-checked': '#17d1aa',

  '--theme-select-language-color': '#15d1aa',

  '--theme-dialog-choice-tabs-text-color': '#353535',
  '--theme-dialog-choice-tabs-text-color-active': '#353535',
  '--theme-dialog-choice-tabs-bottom-border-color-active': '#353535',
  '--theme-dialog-big-button-background-color': '#f0f3f5',
  '--theme-dialog-big-button-border-color': '#f0f3f5',
  '--theme-dialog-big-button-label-color': '#353535',
  '--theme-dialog-big-button-description-color': '#353535',
  '--theme-dialog-title-color': '#2b2c32',
  '--theme-dialog-title-margin': '0 0 38px 0',
  '--theme-dialog-input-margin': '2px 0 24px 0',
  '--theme-dialog-input-actions-margin': '34px 0 0 0',

  '--theme-main-body-background-color': '#ffffff',
  '--theme-main-body-messages-color': '#353535',

  '--theme-modal-overlay-background-color': 'rgba(0, 0, 0, 0.4)',
  '--theme-modal-background-color': '#ffffff',

  '--theme-nav-item-background-color': '#f0f3f5',
  '--theme-nav-item-background-color-hover': '#f9f9fa',
  '--theme-nav-item-background-color-active': '#fff',
  '--theme-nav-item-text-color': '#adaeb6',
  '--theme-nav-item-text-color-active': '#2b2c32',

  '--theme-notification-message-background-color': 'rgba(21, 209, 170, 0.8)',
  '--theme-notification-message-text-color': '#fafbfc',
  '--theme-notification-message-receive-text-color': '#15d1aa',

  '--theme-receive-qr-code-background-color': 'transparent',
  '--theme-receive-qr-code-foreground-color': '#353535',

  '--theme-send-confirmation-dialog-send-values-color': '#15d1aa',
  '--theme-hw-send-confirmation-info-block-background-color': '#f0f3f5',

  '--theme-settings-body-background-color': '#ffffff',
  '--theme-settings-pane-background-color': '#f0f3f5',
  '--theme-settings-pane-border': '1px solid #f0f3f5',
  '--theme-settings-menu-box-background-color': '#f0f3f5',
  '--theme-settings-menu-box-border': '1px solid #f0f3f5',
  '--theme-settings-menu-item-text-color': '#adaeb6',
  '--theme-settings-menu-item-text-color-active': '#2b2c32',
  '--theme-settings-menu-item-text-color-enabled-hover': '#2b2c32',
  '--theme-settings-menu-item-text-color-disabled': '#D9DAE1',
  '--theme-settings-menu-item-background-color-active': '#ffffff',
  '--theme-settings-menu-item-left-border-color-active': '#3d5cdb',
  '--theme-settings-theme-select-title-color': '#2b2c32',

  '--theme-system-error-overlay-attention-icon-color': '#fafbfc',
  '--theme-system-error-overlay-background-color': 'rgba(171, 23, 0, 0.94)', // #AB1700
  '--theme-system-error-overlay-button-background-color': '#ab1700',
  '--theme-system-error-overlay-button-background-color-hover': '#fafbfc',
  '--theme-system-error-overlay-button-border-color': '#fafbfc',
  '--theme-system-error-overlay-button-text-color': '#fafbfc',
  '--theme-system-error-overlay-button-text-color-hover': '#ab1700',
  '--theme-system-error-overlay-text-color': '#fafbfc',

  '--theme-topbar-active-item-bottom-border': '5px solid #17d1aa',
  '--theme-topbar-active-item-top-border': '5px solid transparent',
  '--theme-topbar-category-text-color': '#fafbfc',
  '--theme-topbar-background-color-gradient-start': topbarGradient.start,
  '--theme-topbar-background-color-gradient-end': topbarGradient.end,
  '--theme-topbar-background-color': `linear-gradient(to right, ${topbarGradient.start}, ${topbarGradient.end})`,
  '--theme-topbar-wallet-name-color': '#ffffff',
  '--theme-topbar-wallet-info-color': '#ffffff',
  '--theme-topbar-layout-body-background-color': '#ffffff',

  '--theme-transactions-list-background-color': '#f0f3f5',
  '--theme-transactions-list-failed-background-color': 'rgba(255, 19, 81, 0.07)', // #ff1351
  '--theme-transactions-list-border-color': '#f0f3f5',
  '--theme-transactions-list-group-date-color': '#2b2c32',
  '--theme-transactions-list-item-details-color': '#2b2c32',
  '--theme-transactions-state-failed-background-color': '#fa5380',
  '--theme-transactions-state-failed-text-color': '#bdc5ce',
  '--theme-transactions-state-pending-background-color': '#bdc5ce',
  '--theme-transactions-state-pending-stripes-color': '#b2bac2',
  '--theme-transactions-state-pending-text-color': '#adaeb6',
  '--theme-transactions-priority-color': '#fff',
  '--theme-transactions-priority-low-background-color': 'rgba(250, 83, 128, 0.3)',
  '--theme-transactions-priority-medium-background-color': '#e7d5a3',
  '--theme-transactions-priority-heigh-background-color': 'rgba(21, 209, 170, 0.5)',
  '--theme-transactions-icon-type-expend-background-color': '#15d1aa',
  '--theme-transactions-icon-type-income-background-color': '#9ab2d9',
  '--theme-transactions-icon-type-exchange-background-color': '#10aca4',
  '--theme-transactions-icon-type-failed-background-color': '#eb6d7a',
  '--theme-transactions-sent-color': '#4a4a4a',
  '--theme-transactions-received-color': '#15d1aa',

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

  '--theme-icon-nav-color': '#adaeb6',
  '--theme-icon-nav-color-active': '#ffffff',
  '--theme-icon-topbar-color': '#ffffff',
  '--theme-icon-toggle-menu-color': '#ffffff',
  '--theme-icon-ada-summary-wallet-amount-symbol-color': '#2b2c32',
  '--theme-icon-ada-summary-wallet-pending-confirmation-symbol-color': '#2b2c32',
  '--theme-icon-copy-address-color': '#353535',
  '--theme-icon-back-button-color': '#353535',
  '--theme-icon-close-button-color': '#353535',
  '--theme-icon-transactions-ada-symbol-color': '#353535',
  '--theme-icon-transaction-type-color': '#fafbfc',

  '--theme-wallet-add-title-color': '#ffffff',
  '--theme-wallet-add-sub-title-color': '#ffffff',
  '--theme-wallet-add-option-dialog-item-title-color': '#2B2C32',
  '--theme-wallet-add-option-dialog-item-learn-more-block-bg-color': '#F5F7F9',
  '--theme-wallet-add-option-dialog-item-learn-more-button-color': '#ADAEB6',
  '--theme-wallet-add-option-dialog-item-learn-more-button-bg-color': '#F5F7F9',
  '--theme-wallet-add-translucent-color': 'rgba(255, 255, 255, 0.5)',

  '--theme-instructions-text-color': '#adaeb6',
  '--theme-instructions-recovery-text-color': '#2b2c32',
  '--theme-password-condition-text-color': '#17d1aa',

  '--theme-label-button-color': '#353535',

  '--theme-terms-of-use-text-color': '#38293d',

  '--theme-mnemonic-background-color': '#f0f3f5',
  '--theme-mnemonic-background-color-hover': '#f0f3f5',
  '--theme-mnemonic-border-color': '#9b9b9b',
  '--theme-mnemonic-border-filled-color': '#4a4a4a',
  '--theme-mnemonic-button-text-color': '#353535',

  '--theme-separation-border-color': '#dfe4e8',

  '--theme-support-settings-text-color': '#2b2c32',
  '--theme-support-settings-link-color': '#2b2c32',

  '--theme-banner-warning-background-color': '#f5a623',
  '--theme-trezor-connect-dialog-middle-block-common-background-color': '#ffffff',
  '--theme-trezor-connect-dialog-middle-block-common-error-background-color': '#ffffff',

  '--theme-widgets-progress-step-common-color': '#15d1aa',
  '--theme-underline-light-color': '#adaeB6',
  '--theme-underline-dark-color': '#464749',
  '--theme-widgets-hash-dark-color': '#464749',
  '--theme-widgets-hash-light-color': '#adaeB6',

  '--theme-link-button-background-color-hover': '#D9DDE0',
  '--theme-link-button-text-color': '#000',

  '--theme-export-transactions-to-file': '#f9f9fa',

  '--theme-default-color-blue': '#2249BE',
  '--theme-default-color-blue-dark': '#1A44B7',
  '--theme-default-color-blue-medium': '#4760FF',
  '--theme-default-color-blue-light': '#E1F2FF',
  '--theme-default-color-blue-lightsome': 'rgba(34, 73, 190, 0.6)',

  '--theme-default-main-color': '#17D1AA',
  '--theme-default-main-color-light': '#C9EDE5',

  '--theme-default-color-red': '#FF1351',
  '--theme-default-color-red-medium': 'rgba(255, 19, 81, 0.3)',
  '--theme-default-color-red-light': 'rgba(255, 19, 81, 0.6)',

  // OTHERS
  '--theme-modal-margin-cmn': `${modalMargin.top}px ${modalMargin.right}px ${modalMargin.bottom}px ${modalMargin.left}px`,
  '--theme-modal-min-max-width-cmn': `${560 - (modalMargin.left + modalMargin.right)}px`,
  '--theme-modal-min-max-width-sm': `${465 - (modalMargin.left + modalMargin.right)}px`,
  '--theme-modal-min-max-width-lg': `${680 - (modalMargin.left + modalMargin.right)}px`,

  '--theme-wallet-navigation-tab-height': '50px',

  '--theme-warning-box-bg-color': 'rgba(255, 19, 81, 0.06)', // #FF1351

  '--theme-warning-color': `#FF1351`,
};
