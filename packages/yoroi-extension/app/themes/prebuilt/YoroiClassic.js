// @flow
//  ==== Theme: Yoroi Classic === //

// TABS

const YoroiClassic = {
  // COLORS

  '--theme-send-confirmation-dialog-send-values-color': '#ea4c5b',
  '--theme-hw-send-confirmation-info-block-background-color': '#f3f3f5',

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

  '--theme-hw-connect-dialog-middle-block-common-background-color': '#f3f3f5',
  '--theme-hw-connect-dialog-middle-block-common-error-background-color': '#fdf1f0',

  '--theme-widgets-hash-dark-color': '#000000',
  '--theme-widgets-hash-light-color': '#929293',

  '--theme-wallet-navigation-tab-height': '40px',
};

export const getThemeVars: ('shelley' | void) => { ... } = _env => {
  return YoroiClassic;
};
