// @flow
//  ==== Theme: Yoroi Classic === //

// TABS

// OPTION CARD

// Sidebar gradient
const sidebarGradient = {
  start: '#373f52',
  end: '#373f52',
};

const YoroiClassic = {
  // COLORS

  '--theme-receive-qr-code-background-color': 'transparent',
  '--theme-receive-qr-code-foreground-color': '#121327',

  '--theme-send-confirmation-dialog-send-values-color': '#ea4c5b',
  '--theme-hw-send-confirmation-info-block-background-color': '#f3f3f5',

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

  '--theme-topbar-background-color-gradient-start': sidebarGradient.start,
  '--theme-topbar-background-color-gradient-end': sidebarGradient.end,
  '--theme-topbar-background-color': `linear-gradient(to right, ${sidebarGradient.start}, ${sidebarGradient.end})`,
  '--theme-topbar-wallet-name-color': '#fafbfc',
  '--theme-topbar-wallet-info-color': '#fafbfc',
  '--theme-topbar-layout-body-background-color': '#ffffff',

  '--theme-transactions-state-pending-background-color': '#F0F3F5',
  '--theme-transactions-state-pending-stripes-color': 'rgba(217, 221, 224, 0.2)', // #D9DDE0
  '--theme-transactions-state-pending-text-color': '#ADAEB6',
  '--theme-transactions-priority-low-background-color': 'rgba(255, 19, 81, 0.15)', // #ff1351
  '--theme-transactions-priority-low-text-color': '#FA5F88',
  '--theme-transactions-priority-medium-background-color': 'rgba(245, 166, 35, 0.3)', // F5A623
  '--theme-transactions-priority-medium-text-color': '#F5A623',
  '--theme-transactions-priority-high-background-color': '#C9EDE5',
  '--theme-transactions-priority-high-text-color': '#17D1AA',

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
};

export const getThemeVars: ('shelley' | void) => { ... } = _env => {
  return YoroiClassic;
};
