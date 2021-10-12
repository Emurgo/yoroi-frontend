// @flow
//  ==== Theme: Yoroi Modern === //

// Modal Margin
const modalMargin = {
  top: 24,
  right: 40,
  bottom: 40,
  left: 40,
};

const YoroiModern = {
  // COLORS

  '--theme-send-confirmation-dialog-send-values-color': '#15d1aa',
  '--theme-hw-send-confirmation-info-block-background-color': '#f0f3f5',

  '--theme-transactions-state-pending-background-color': '#F0F3F5',
  '--theme-transactions-state-pending-stripes-color': 'rgba(217, 221, 224, 0.2)', // #D9DDE0
  '--theme-transactions-state-pending-text-color': '#ADAEB6',
  '--theme-transactions-priority-low-background-color': 'rgba(255, 19, 81, 0.15)', // #ff1351
  '--theme-transactions-priority-low-text-color': '#FA5F88',
  '--theme-transactions-priority-medium-background-color': 'rgba(245, 166, 35, 0.3)', // F5A623
  '--theme-transactions-priority-medium-text-color': '#F5A623',
  '--theme-transactions-priority-high-background-color': '#C9EDE5',
  '--theme-transactions-priority-high-text-color': '#17D1AA',

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

  '--theme-maintenance-background-color': '#050D23',
  '--theme-maintenance-border-color': '#D9DDE0',

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

  '--theme-trezor-connect-dialog-middle-block-common-background-color': '#ffffff',
  '--theme-trezor-connect-dialog-middle-block-common-error-background-color': '#ffffff',

  '--theme-widgets-hash-dark-color': '#464749',
  '--theme-widgets-hash-light-color': '#adaeB6',

  '--theme-default-color-blue': '#2249BE',

  // OTHERS
  '--theme-modal-min-max-width-cmn': `${560 - (modalMargin.left + modalMargin.right)}px`,
  '--theme-modal-min-max-width-sm': `${465 - (modalMargin.left + modalMargin.right)}px`,
  '--theme-modal-min-max-width-lg': `${680 - (modalMargin.left + modalMargin.right)}px`,

  '--theme-wallet-navigation-tab-height': '62px',

  // Dashboard
  '--theme-dashboard-page-background-color': '#ffffff',
  '--theme-dashboard-link-color': '#ADAEB6',
  '--theme-dashboard-text-color': '#38393D',
  '--theme-dashboard-label-color': '#676970',
  '--theme-dashboard-label-underline-color': 'rgba(135, 145, 173, 0.8)',
  '--theme-dashboard-card-shadow-color': 'rgba(24, 26, 30, 0.08)',
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
};

// *************************************************************
// Here we are overriding YoroiModern theme for Shelley Testnet
// Creating a new theme is costly because not only color
// changes but layout is different in different theme.
// e.g for new theme we need to override :global(.NewTheme)
// is needed in UI style files or :global(.OldTheme, .NewTheme)
// *************************************************************
const ShelleyTestnetOverrides = {
  // React Polymorph buttons
  // Sidebar
  // Language Selection
  // Top banner
  '--th-palette-background-banner-warning': 'linear-gradient(41deg, #1A44B7 0%, #4760FF 100%)',
};

export const getThemeVars: ('shelley' | void) => { ... } = env => {
  if (env === 'shelley') {
    const mergedTheme = {
      ...YoroiModern,
      ...ShelleyTestnetOverrides,
    };
    return mergedTheme;
  }
  return YoroiModern;
};
