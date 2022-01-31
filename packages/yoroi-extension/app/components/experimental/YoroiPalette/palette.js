// @flow
export const getPalette: any => any = (theme: any) => {
   return  {
        /* === BASE === */
        '--yoroi-palette-common-white': theme.palette.common.white,
        '--yoroi-palette-common-black': theme.palette.common.black,

        '--yoroi-palette-primary-50': theme.palette.primary['50'],
        '--yoroi-palette-primary-100': theme.palette.primary['100'],
        '--yoroi-palette-primary-200': theme.palette.primary['200'],
        '--yoroi-palette-primary-300': theme.palette.primary['300'],
        '--yoroi-palette-primary-contrastText': theme.palette.primary.contrastText,

        '--yoroi-palette-secondary-50': theme.palette.secondary['50'],
        '--yoroi-palette-secondary-100': theme.palette.secondary['100'],
        '--yoroi-palette-secondary-200': theme.palette.secondary['200'],
        '--yoroi-palette-secondary-300': theme.palette.secondary['300'],
        '--yoroi-palette-secondary-contrastText': theme.palette.secondary.contrastText,

        '--yoroi-palette-error-50': theme.palette.error['50'],
        '--yoroi-palette-error-100': theme.palette.error['100'],
        '--yoroi-palette-error-200': theme.palette.error['200'],

        '--yoroi-palette-cyan-50': theme.palette.cyan['50'],
        '--yoroi-palette-cyan-100': theme.palette.cyan['100'],

        '--yoroi-palette-gray-50': theme.palette.gray['50'],
        '--yoroi-palette-gray-100': theme.palette.gray['100'],
        '--yoroi-palette-gray-200': theme.palette.gray['200'],
        '--yoroi-palette-gray-300': theme.palette.gray['300'],
        '--yoroi-palette-gray-400': theme.palette.gray['400'],
        '--yoroi-palette-gray-500': theme.palette.gray['500'],
        '--yoroi-palette-gray-600': theme.palette.gray['600'],
        '--yoroi-palette-gray-700': theme.palette.gray['700'],
        '--yoroi-palette-gray-800': theme.palette.gray['800'],
        '--yoroi-palette-gray-900': theme.palette.gray['900'],
        '--yoroi-palette-background-overlay': theme.palette.background.overlay,

        '--yoroi-palette-tx-status-pending-background': theme.palette.txStatus.pending.background,
        '--yoroi-palette-tx-status-pending-text': theme.palette.txStatus.pending.text,
        '--yoroi-palette-tx-status-pending-stripes': theme.palette.txStatus.pending.stripes,
        '--yoroi-palette-tx-status-high-background': theme.palette.txStatus.high.background,
        '--yoroi-palette-tx-status-high-text': theme.palette.txStatus.high.text,
        '--yoroi-palette-tx-status-failed-background': theme.palette.txStatus.failed.background,
        '--yoroi-palette-tx-status-failed-text': theme.palette.txStatus.failed.text,
        '--yoroi-palette-tx-status-medium-background': theme.palette.txStatus.medium.background,
        '--yoroi-palette-tx-status-medium-text': theme.palette.txStatus.medium.text,
        '--yoroi-palette-tx-status-low-background': theme.palette.txStatus.low.background,
        '--yoroi-palette-tx-status-low-text': theme.palette.txStatus.low.text,

        '--yoroi-palette-background-banner-warning': theme.palette.background.banner.warning,
        '--yoroi-palette-background-walletAdd-title': theme.palette.background.walletAdd.title,
        '--yoroi-palette-background-walletAdd-subtitle': theme.palette.background.walletAdd.subtitle,

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

        '--yoroi-sidebar-text': theme.palette.background.sidebar.text,
        '--yoroi-sidebar-background': `linear-gradient(22.58deg, ${theme.palette.background.sidebar.start} 0%, ${theme.palette.background.sidebar.end} 100%)`,
        '--yoroi-sidebar-end': theme.palette.background.sidebar.end,

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
        '--yoroi-send-confirmation-dialog-send-values-color':
          theme.name === 'classic' ? '#ea4c5b' : '#15d1aa',

        '--yoroi-hw-connect-dialog-middle-block-common-background-color':
          theme.name === 'classic' ? '#f3f3f5' : '#ffffff',
        '--yoroi-hw-connect-dialog-middle-block-common-error-background-color':
          theme.name === 'classic' ? '#fdf1f0' : '#ffffff',

        '--yoroi-terms-of-use-text-color': theme.name === 'classic' ? '#121327' : '#38293d',
        '--yoroi-loading-background-color': '#fafbfc',

        '--yoroi-support-settings-text': theme.name === 'classic' ? '#121327' : '#2b2c32',
        '--yoroi-instructions-text-color': theme.name === 'classic' ? '#121327' : '#adaeb6',
        '--yoroi-mnemonic-background-color-hover':
          theme.name === 'classic' ? 'rgba(242, 183, 172, 0.12)' : '#f0f3f5',
        '--yoroi-mnemonic-background-color':
          theme.name === 'classic' ? 'rgba(218, 164, 154, 0.12)' : '#f0f3f5',
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
   }

}

const getColorPath = (
  themePalette: any,
  color: string,
  ) => {

    const path = []
    for (const entery of Object.entries(themePalette)) {
      const [key, value] = entery
      if (typeof value === 'object') {
        for (const valueEntery of Object.entries(value)) {
          if (valueEntery[1] === color) {
            path.push(key, valueEntery[0])
            break
          }
        }
      }

      if (path.length !== 0) break
    }
    return path
}

type MultiLayerColor = {|
  parent: string,
  child: string,
  hex: string,
  path: string[],
|}

type NameToHex = {|
  name: string,
  hex: string,
|}

type FormatedPalette = {|
  multiLayersColor: MultiLayerColor,
  nameToHex: NameToHex,
|}

export const formatPalette = (palette: any, theme: any): FormatedPalette => {
  const formatedPalette: FormatedPalette = {
    nameToHex: [],
    multiLayerColor: []
  }

  for (const name of Object.keys(palette)) {
    if(palette[name] && palette[name].startsWith('var(')) {
      const secondColorName = palette[name].slice(4, -1)
      const secondColorHex = palette[secondColorName]
      const path = getColorPath(theme.palette, secondColorHex)
      formatedPalette.multiLayerColor.push({
        parent: name,
        child: secondColorName,
        hex: secondColorHex,
        path
      })
    } else {
      formatedPalette.nameToHex.push({
        name, hex: palette[name]
      })
    }
  }

  return formatedPalette
}