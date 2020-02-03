// @flow
//  ==== Theme: Yoroi Modern === //
import environment from '../../environment';
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

const YoroiModern = {
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

  '--theme-bordered-box-background-color': '#ffffff',
  '--theme-bordered-box-border': '0px solid #ffffff',
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
  '--theme-button-outlined-border-color': '#3154CB',
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
  '--theme-dialog-input-margin': '10px 0 24px 0',
  '--theme-dialog-input-actions-margin': '34px 0 0 0',
  '--theme-dialog-password-input-actions-margin-top': '10px',

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
  '--theme-settings-pane-background-color': '#ffffff',
  '--theme-settings-pane-border': '1px solid #ffffff',
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

  '--theme-transactions-list-text-color': '#242838',
  '--theme-transactions-list-background-color': '#f0f3f5',
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

  '--theme-icon-nav-color': '#adaeb6',
  '--theme-icon-nav-color-active': '#ffffff',
  '--theme-icon-topbar-color': '#ffffff',
  '--theme-icon-toggle-menu-color': '#ffffff',
  '--theme-icon-ada-summary-wallet-amount-symbol-color': '#2b2c32',
  '--theme-icon-ada-summary-wallet-pending-confirmation-symbol-color': '#2b2c32',
  '--theme-icon-copy-address-color': '#353535',
  '--theme-icon-copy-address-button-background-color': '#D9DDE0',
  '--theme-icon-back-button-color': '#353535',
  '--theme-icon-close-button-color': '#353535',
  '--theme-icon-transactions-ada-symbol-color': '#353535',
  '--theme-icon-transactions-ada-symbol-pending-color': '#D9DAE0',
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

  '--theme-wallet-navigation-tab-height': '62px',
  '--theme-wallet-navigation-tab-text-color': '#6B7384',
  '--theme-wallet-navigation-tab-text-color-active': '#17D1AA',

  '--theme-warning-box-bg-color': 'rgba(255, 19, 81, 0.06)', // #FF1351

  '--theme-warning-color': `#FF1351`,

  '--theme-tooltipbox-border-color': 'rgba(77,32,192,0.08)', // 4d20c0

  // Dashboard
  '--theme-dashboard-page-background-color': '#ffffff',
  '--theme-dashboard-link-color': '#ADAEB6',
  '--theme-dashboard-text-color': '#38393D',
  '--theme-dashboard-label-color': '#676970',
  '--theme-dashboard-label-underline-color': 'rgba(135, 145, 173, 0.8)',
  '--theme-dashboard-card-shadow-color': 'rgba(65, 37, 150, 0.07)',
  '--theme-dashboard-card-border-color': 'rgba(77, 32, 192, 0.08)',
  '--theme-dashboard-card-vertical-separator-color': '#E6E6E6',
  '--theme-dashboard-card-nodelegation-background-color': '#F9FBFF',
  '--theme-dashboard-tooltip-background-color': 'rgba(56, 57, 61, 0.75)',
  '--theme-dashboard-tooltip-text-color': '#FFFFFF',
  '--theme-dashboard-stakepool-head-background-color': '#F4F6FC',
  '--theme-dashboard-epoch-time-background': '#F0F3F5',
  '--theme-dashboard-percentage-epoch-base': '#B7C3ED',
  '--theme-dashboard-percentage-epoch-circle': '#3154CB',
  '--theme-dashboard-percentage-stake-base': '#FFEDF2',
  '--theme-dashboard-percentage-stake-circle': '#FF1755',
  '--theme-dashboard-graph-tab-color': '#ADAEB6',
  '--theme-dashboard-graph-active-tab-color': '#38393D', // temporary since we have one tab. For multi-tab use #3D60CD
  '--theme-dashboard-graph-radio-color': '#93979C',
  '--theme-dashboard-graph-active-radio-color': '#17D1AA',
  '--theme-dashboard-graph-axis-tick-color': '#ADAEB6',
  '--theme-dashboard-graph-axis-text-color': '#38393D',
  '--theme-dashboard-graph-legend-text-color': '#676970',
  '--theme-dashboard-graph-legend-icon-size': 12,
  '--theme-dashboard-graph-bar-hover-background-color': '#D9DDE0',
  '--theme-dashboard-graph-bar-primary-color': '#6D80FF',
  '--theme-dashboard-graph-bar-secondary-color': '#1A44B7',
  '--theme-dashboard-graph-bar-width': 16,
  '--theme-dashboard-graph-font-size': 12,
  '--theme-dashboard-graph-line-height': 14,
  '--theme-dashboard-graph-tooltip-font-size': '11px',
  '--theme-dashboard-graph-tooltip-line-height': '14px',
  '--theme-dashboard-graph-tooltip-text-color': '#FFFFFF',
  '--theme-dashboard-graph-tooltip-background': 'rgba(56, 57, 61, 0.7)',

  // Sidebar
  '--theme-sidebar-background-color': 'linear-gradient(22.58deg, rgba(36,74,191,1) 0%, rgba(71,96,255,1) 100%)',
  '--theme-sidebar-text-left-spacing': '16px',
  '--theme-sidebar-text-color': '#FFFFFF',
  '--theme-sidebar-text-font-size': '14px',
  '--theme-sidebar-text-line-height': '22px',
  '--theme-sidebar-icon-color': '#FFFFFF',
  '--theme-sidebar-icon-color-hover': '#17D1AA',
  '--theme-sidebar-icon-color-active': '#17D1AA',
  '--theme-sidebar-item-background-color-hover': '#2C30D1',

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
  '--theme-wallet-dropdown-accent-text-color': '#17D1AA',
  '--theme-wallet-dropdown-box-shadow': '0 10px 12px 0 rgba(0, 0, 0, 0.16)',
  '--theme-wallet-dropdown-background-color': '#FFFFFF',
  '--theme-wallet-dropdown-selected-background-color': '#F0F3F5',
  '--theme-wallet-dropdown-row-border-color': '#E0E3EB',
  '--theme-wallet-dropdown-border-radius': '8px',
  '--theme-wallet-dropdown-min-width': '608px',
  '--theme-wallet-plate-main-text-color': '#242838',
  '--theme-wallet-plate-secondary-text-color': '#6B7384',
  '--theme-wallet-receive-submit-button-background-color': '#17D1AA',
  '--theme-wallet-receive-hash-text-color': '#242838',
  '--theme-wallet-receive-hash-used-text-color': '#6B7384',
  '--theme-wallet-receive-wallet-hash-text-color': '#353535',
  '--theme-wallet-receive-label-text-color': '#2B2C32',

  // Navbar

  '--theme-navbar-height': '60px',
  '--theme-navbar-background-color': '#F0F3F5',
  '--theme-navbar-color': '#6B7384',
};

// *************************************************************
// Here we are overriding YoroiModern theme for Shelley Testnet
// Creating a new theme is costly because not only color
// changes but layout is different in different theme.
// e.g for new theme we need to override :global(.NewTheme)
// is needed in UI style files or :global(.OldTheme, .NewTheme)
// *************************************************************
let ShelleyTestnetOverrides = {};
if (environment.isShelley()) {
  ShelleyTestnetOverrides = {
    // React Polymorph buttons
    '--rp-button-bg-color': '#3154CB',
    '--rp-button-bg-color-active': '#3154CB',
    '--rp-button-bg-color-disabled': 'rgba(49, 84, 203, 0.3)', // #3154CB
    '--rp-button-bg-color-hover': '#4760FF',
    // Toolbar
    '--theme-topbar-background-color': 'linear-gradient(225deg, #F14D78 0%, #1A44B7 100%)',
    '--theme-topbar-active-item-bottom-border': '5px solid #ffffff',
    // Button Primary
    '--theme-button-primary-background-color': '#3154CB',
    '--theme-button-primary-background-color-hover': '#4760FF',
    '--theme-button-primary-background-color-active': '#3154CB',
    '--theme-button-primary-background-color-disabled': 'rgba(49,84,203,0.35)',
    // Button Outline
    '--theme-button-outlined-text-color': '#3154CB',
    '--theme-button-outlined-border-color-hover': '#3154CB',
    '--theme-button-outlined-background-color': '#FFFFFF',
    '--theme-button-outlined-background-color-hover': 'rgba(49, 84, 203, 0.15)',
    '--theme-button-outlined-background-color-active': '#3154CB',
    '--theme-button-outlined-active-text-color': '#ffffff',
    '--theme-button-outlined-text-color-disabled': 'rgba(49, 84, 203, 0.35)',
    '--theme-button-outlined-background-color-disabled': 'rgba(49, 84, 203, 0.35)',
    // Language Selection
    '--theme-select-language-color': '#3154CB',
    // Top banner
    '--theme-banner-warning-background-color': 'linear-gradient(41deg, #1A44B7 0%, #4760FF 100%)'
  };
}

export default Object.assign(YoroiModern, ShelleyTestnetOverrides);
